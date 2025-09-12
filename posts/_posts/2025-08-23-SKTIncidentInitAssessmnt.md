<img width="1167" height="158" alt="{27ECFED3-4E67-410A-9739-FB12CBDF3B45}" src="https://github.com/user-attachments/assets/367fde5d-b938-459e-bd59-70cc3f31cb3d" />---
layout: post
title: SKT incident overview (from my prev. blog)
description: >
  An easy-to-understand walk-through from the official initial assessment by the Ministry of Science, Technology, and Communications
sitemap: false
---

## SKT incident
> This post provides an overview of the data breach incident at SKT, explains the function of the compromised server, analyzes what kind of information may have been leaked, and discusses the potential risks of how such information could be exploited. The purpose is to make the SKT incident easier to understand from a theoretical perspective.

_Disclaimer: This blog post is based on 3GPP (3rd Generation Partnership Project) standards, which define mobile network architecture. It is written to illustrate the overall structure of mobile networks and explain from a macro perspective which part was attacked, especially for readers unfamiliar with telecom operations. Since this analysis is not based on direct knowledge of SKT’s architecture, some parts may differ from the actual system. For reference, 3GPP is the global body that standardizes mobile communications, and all telecom operators design their networks based on its specifications._

## Overview of the SKT Data Breach

> Since the case has already been widely reported in the media, I will use excerpts from news articles to summarize the incident.

On April 18 at 11:20 p.m., SK Telecom’s security monitoring center detected abnormal data traffic and found malware implanted on its billing analysis equipment, along with evidence of deleted files. At 1:40 a.m. on April 19, SKT isolated the compromised device and began investigating the intrusion path and possible data leakage. Later, at 11:40 p.m. on April 19, suspicious signs of data leakage from the Home Subscriber Server (HSS) were confirmed. 
<[Source](https://www.khan.co.kr/article/202504291653021/?nv=stand&utm_source=naver&utm_medium=portal_news&utm_content=&utm_campaign=newsstandC)>

On April 22, SKT officially announced that malware infection had resulted in partial leakage of customers’ USIM information. On April 29, the Ministry of Science and ICT released preliminary investigation results, as shown [here](https://www.msit.go.kr/bbs/view.do?sCode=user&mPid=208&mId=307&bbsSeqNo=94&nttSeqNo=3185757)

## Function of the compromised Equipment
According to SKT, the affected system was the Home Subscriber Server (HSS), a core server in 4G networks that authenticates user devices and manages subscriber information.

For readers less familiar with mobile networks, let’s first review the LTE architecture, within which the HSS plays a central role.

> Although HSS is an LTE component, this explanation does not mean it has no relevance to 5G. The 5G architecture was introduced under the concepts of Standalone (SA) and Non-Standalone (NSA). SA is a pure 5G system, whereas NSA extends the existing LTE architecture to support 5G services. Thus, even an LTE HSS can affect 5G subscribers.

## LTE Network Components
When you use a smartphone (User Equipment, UE) to access the internet (excluding voice calls), several nodes are involved:
1. Evolved Node B (eNodeB): Base station

   This is the radio node that communicates with smartphones. Poor reception (“no signal”) usually means your device is too far from or obstructed from the nearest eNodeB.
   > The term "NodeB" comes from 3G. With 4G, it evolved to "eNodeB."
2. Mobility Management Entity (MME)

   Handles initial connection and mobility management. For example:
   - When the smartphone is powered on, it sends an attach request via the eNodeB to the MME.
   - The MME checks the IMSI (International Mobile Subscriber Identity) and communicates with the HSS to authenticate.
   - It checks the device’s IMEI with the Equipment Identity Register (EIR) to detect stolen or swapped phones.
   - Once authenticated, the MME sets up a data session with the Serving Gateway (SGW).
   - The smartphone is then connected to the internet via the Packet Gateway (PGW).

   Mobility management means that when moving from area A to B, the MME coordinates handover between eNodeBs with support from the SGW.
3. Serving Gateway (SGW)

   Forwards user packets between the eNodeB and the PGW, and manages data transfer during handovers.
4. Packet Gateway (PGW)

   Acts as the bridge to external networks (internet), performing NAT (network address translation) to map subscriber traffic.

## HSS with MME
The HSS stores essential subscriber data, including:
| Data Category       | Examples                                       |
|---------------------|------------------------------------------------|
| Subscriber Identity | IMSI, MSISDN (phone number)                    |
| Authentication Data | Ki, RAND, XRES, AUTN, KASME                     |
| Service Information | APN list, QoS profile, charging policy          |
| Location Data       | Current MME ID, Tracking Area ID                |
| Access Policy       | 3GPP access, non-3GPP access (Wi-Fi, WLAN)      |
| Subscription Status | Activation of voice/data services               |
| IMS Data            | Public/Private IDs, IMS registration            |
| Roaming Info        | Allowed roaming regions, restrictions           |
|----------------------------------------------------------------------|

Key points:
- IMSI: Unique subscriber identifier, not normally visible to users.
- Ki: A 128-bit secret key stored in the SIM and HSS, used for authentication. Both network and device compute results using Ki, and the MME verifies if they match.
Thus, the HSS is the repository of all essential subscriber information, with Ki being the cornerstone of authentication.

## What Does This Mean?
According to the April 29 Ministry of Science and ICT press release, the preliminary investigation found that 25 types of data were leaked, including four critical items needed to clone a USIM (phone number, IMSI, Ki, ICCID). However, IMEI data was not leaked.
The difference between IMSI and IMEI:
| Type       | Explaination                                       |
|---------------------|------------------------------------------------|
|IMSI |	Used by the carrier (SKT) to identify the subscriber (e.g., Joon) |
| IMEI	| Used by the carrier to identify the device (e.g., Joon’s iPhone 15 Pro) |
|---------------------|------------------------------------------------|

The ICCID uniquely identifies the SIM card itself. Together with MSISDN, IMSI, and Ki, attackers have the necessary information to clone SIM cards.

Fortunately, the ministry stated that since IMEI was not leaked, SIM Swapping attacks can be prevented if subscribers enable SIM Protection Services. This works because if an attacker inserts a cloned SIM into their own phone, the IMEI mismatch (compared with the original subscriber’s IMEI stored in the EIR) will cause the MME to reject the connection attempt.

Without SIM protection, however, policies may vary. If SKT’s system accepts a new IMEI as a device change, the attacker could potentially bypass protection.

## Conclusion
As the Ministry of Science and ICT emphasized, the investigation is still ongoing, and the full extent of the data breach remains uncertain. For now, subscribing to SIM Protection Services appears to be the most effective countermeasure.

Some reports mention the use of the BPFDoor backdoor in this attack, but covering it in detail would require a separate post.

Since this topic overlaps with my graduate research interests, I wrote this blog post both as a study exercise and to help readers better understand the incident. I hope it sheds some light on the SKT case.

## More information (based on the book titled 5G New Radio in Bullets) 
> For avid people learning cellular networks, this book was really helpful for me to understand how our modern cellular networks work. Thanks to my advisor Sang Kim for recommending this book for my research.

### UE Identity
| Types                               | Definition                                                                                             | Stored in                                                                                                   | Stored (managed) by                                                                                                                           | Format                                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IMSI**                            | Globally unique permanent subscriber identity (in 5G, often the SUPI of type IMSI)                 | USIM                                                                                           | Network-side subscription data: **UDM/UDR (authoritative record). The USIM copy is provisioned by the operator, not “written by UDM”. | MCC (3) + MNC (2–3) + MSIN (≤10) → up to 15 digits                |
| **IMEI**                            | Permanent device identity                                                       | UE hardware                                                   | 5G-EIR                                                                             | TAC(8) + SNR(6) + Check digit(1)                                                        |
| **SUPI / SUCI**                     | SUPI: permanent subscriber ID. SUCI: radio-transmitted, concealed form of SUPI for privacy | SUPI: UDM/UDR. SUCI: generated on the UE on the fly using the home network public key | SUPI: UDM/UDR. SUCI de-conceal: SIDF (function within UDM)                                                                        | SUPI types: IMSI or NAI. SUCI fields: SUPI type, Home-Network ID, Routing Indicator, Protection Scheme ID, HN Public Key ID, Scheme Output (e.g., ECIES) |
| **5G-GUTI**                         | Temporary UE identity used for NAS procedures (privacy; basis for paging)                          | UE & AMF (NAS context)                                                                                      | AMF                                                                                                                   | 5G-GUTI = GUAMI + 5G-TMSI. GUAMI = MCC + MNC + AMF ID (Region 8, Set 10, Pointer 6). 5G-TMSI = 32b                                                |
| **5G-S-TMSI** *(useful for paging)* | Short form of 5G-GUTI used in paging/initial access                                                    | UE & AMF                                                                                                    | AMF                                                                                                                                       | AMF Set ID (10) + AMF Pointer (6) + 5G-TMSI (32)                                                                                       |



