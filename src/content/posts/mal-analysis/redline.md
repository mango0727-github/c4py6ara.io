---
title: "Malware Analysis Report: RedLine"
description: "Redline"
pubDatetime: 2025-03-03T12:00:00+09:00
tags:
  - "malware analysis"
---

## Overview
| Type | Contents |
|-----|-------|
| SHA | e3544f1a9707ec1ce083afe0ae64f2ede38a7d53fc6f98aab917ca049bc63e69 |
| MD5 | 8556792f20126e1ed89f93e1e26030e5 |
| Main Behavior | Steals various information and can download files, execute CMD, etc. if needed |
| Drop File | Netflix checker by XRisky v2.exe Winlogon.exe svchost.exe |
| Mutex name | Not found |
| C&C Server | siyatermi[.]duckdns[.]org:17044 |

## Analysis detail

Initial analysis through PEStudio confirmed that it is an EXE file. Considering the high entropy, it is likely to be packed or encrypted.

![Figure 1. PEStudio analysis result](./assets/redline/image.png)

Figure 1. PEStudio analysis result

We also found that PEiD used the .NET framework, so we decided to utilize dnSpy.

![Figure 2. PEiD analysis result]![Figure 1. PEStudio analysis result](./assets/redline/image1.png)

Figure 2. PEiD analysis result

We first ran PE with Procmon running and filtered CreateFile and Detail's Generic Write, and found that a total of three files were dropped: winlogon.exe, NetFlix Checker by xRisky v2.exe, and svchost.exe.

![Figure 3. File drop log on Procmon]![Figure 1. PEStudio analysis result](./assets/redline/image-2.png)

Figure 3. File drop log on Procmon

![Figure 4. Dropped files on the filesystem (NetFlix Checker by xRisky v2.exe dropped in the same location as the original file)](./assets/redline/image-3.png)

Figure 4. Dropped files on the filesystem (NetFlix Checker by xRisky v2.exe dropped in the same location as the original file)

The file was analyzed by dnSpy. I don't know why, but I had to analyze the x64 version instead of the x32 version for the analysis to work. The figure below shows that the malicious file is encrypted with AES.

![Figure 5. dnSpy decompilation result of the original file (encryption routine)](./assets/redline/image-4.png)

Figure 5. dnSpy decompilation result of the original file (encryption routine)

However, the encryption is not a problem because if you look at the Main() code, you can see that even if it is encrypted, the files are dropped after decryption, and the drop files are executed using Process.Start(text), i.e., code injection.

![Figure 6. Decompilation result of original file on dnSpy (file drop and execution routine)](./assets/redline/image-5.png)

Figure 6. Decompilation result of original file on dnSpy (file drop and execution routine)

In order to get only the dropped samples without the process execution of the files, I deleted the Start() part at the end and recompiled and manipulated it to get the samples without file execution.

![Figure 7. Deleting the code injection part for file extraction](./assets/redline/image-6.png)

Figure 7. Deleting the code injection part for file extraction

Since the file was still encoded, we used de4dot to decode it, and finally obtained the sample exe for analysis.

![Figure 8. Sample on the file system](./assets/redline/image-7.png)

Figure 8. Sample on the file system

After loading the PE file into dnSpy and looking at the modules, it was intuitively clear what the file does. The malware is an infostealer, which literally means it steals information, and its function seems to be to send the stolen information to C2.

![Figure 9. Module cleanup part of Winlogon.exe dnSpy decompilation results](./assets/redline/image-8.png)

Figure 9. Module cleanup part of Winlogon.exe dnSpy decompilation results

We were able to get the C2 address from Class 10, which appears at the beginning of the Main() function, and we can see that it is constantly trying to connect to the same URL on Procmon.

![Figure 10. Identifying the C2 address](./assets/redline/image-9.png)

Figure 10. Identifying the C2 address

![Figure 11.](./assets/redline/image10.png)

Figure 11.

Aside from information theft, the most threatening part is that the malicious actor can perform various additional actions besides information theft through the connection to C2, such as downloading, executing PE files, downloading and executing, opening links, and executing cmd.exe, as shown below.

![Figure 12. RemoteTask Action Definition](./assets/redline/image-11.png)

Figure 12. RemoteTask Action Definition

In fact, almost any action is possible with exe, for example, you can execute shellcode through the following class to perform the desired action.

![Figure 13. Class definition for Cmd execution (1)](./assets/redline/image-12.png)

Figure 13. Class definition for Cmd execution (1)

![Figure 14. Class definition for Cmd execution (2)](./assets/redline/image-13.png)

Figure 14. Class definition for Cmd execution (2)

The flow of Main() is to repeat the scanning process infinitely, continuously update the scan results, and send the results to C2. Therefore, it will be the point of Infostealer's analysis to see what kind of data is being stolen, which is defined in the modules.

Here is a partial list of the stealing information defined in each module. We'll skip the descriptions of the figures because they are the same as the descriptions in the subheadings.

Redline collects URL, Username, Password, etc. stored in the browser.

![Figure 15](./assets/redline/image-14.png)

Figure 15

Collecting autofill data stored in the browser.

![Figure 16](./assets/redline/image-15.png)

Figure 16

Information about various cryptocurrencies.

![Figure 17](./assets/redline/image-16.png)

Figure 17

Browser login data, web data, and cookie information.

![Figure 18](./assets/redline/image-17.png)

Figure 18

Information about browser name, version, and file path.

![Figure 19](./assets/redline/image-18.png)

Figure 19

Credit card information such as owner, expiration year/month, card number, etc.

![Figure 20](./assets/redline/image-19.png)

Figure 20

Location information such as city, region, country code, latitude, longitude, and zip code.

![Figure 21](./assets/redline/image-20.png)

Figure 21

![Figure 22](./assets/redline/image-21.png)

Figure 22

Name, profile, credit card information, cookies, etc. stored within the browser, although there is some overlap.

![Figure 23](./assets/redline/image-22.png)

Figure 23

Host information, information about the HTTP protocol

![Figure 24](./assets/redline/image-23.png)

Figure 24

Information about locally stored files, especially extensions that may contain sensitive material such as doc, csc, docx, dll, txt, etc.

![Figure 25](./assets/redline/image-24.png)

Figure 25

Browser (Chrome browser path and Gecko engine, blocked IPs, etc.), file, FTP, wallet, screen, Telegram, VPN, Steam, Discord, etc.

![Figure 26](./assets/redline/image-25.png)

Figure 26

![Figure 27](./assets/redline/image-26.png)

Figure 27

Hardware, host machine name, OS version, language, screen size, etc.

![Figure 28](./assets/redline/image-27.png)

Figure 28

![Figure 29](./assets/redline/image-28.png)

Figure 29

Country, city, time zone, IP address, monitor information, zip code, and various file locations.

![Figure 30](./assets/redline/image-29.png)

Figure 30

RAM information

![Figure 31](./assets/redline/image-30.png)

Figure 31

Display name

![Figure 32](./assets/redline/image-31.png)

Figure 32

Information about disk drives

![Figure 33](./assets/redline/image-32.png)

Figure 33

Process ID

![Figure 34](./assets/redline/image-33.png)

Figure 34
