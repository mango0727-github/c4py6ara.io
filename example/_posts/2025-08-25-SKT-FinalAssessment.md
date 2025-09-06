---
layout: post
title: Malware Analysis Report
description: >
  Redline
sitemap: false
hide_last_modified: true
---


# Final Report Summary

  The Ministry of Science and ICT has released the final report on the SKT incident, in which a massive amount of user information was leaked.  
The investigation committee examined 42,605 servers and identified 33 malware samples, including 27 BPFDoor found across 33 servers.

The committee also confirmed that 25 different types of USIM-related data had been leaked, totaling approximately 9.82 GB in size.

For further details, please refer to the official report [here](https://www.msit.go.kr/bbs/view.do?sCode=user&mId=307&mPid=208&pageIndex=1&bbsSeqNo=94&nttSeqNo=3185964&searchOpt=ALL&searchTxt).

---

# Attack Chain

### 1. Initial Access
  According to the final report, the attacker first compromised Server A used for maintenance and operation.
> The report does not specify what Server A is and its functionality. But Server A is seemingly one of management servers that SKT had established in order to manage and operate core network.  

The committee suggested several possible attack scenarios, including:

- **Exploitation of VPN vulnerabilities:**
  Taiwan-based cybersecurity company, TeamT5, suggested that vulnerabilities in Ivanti VPN products might have been exploited to gain access to the system management subnet.  

  > There is no definitive evidence that SKT was using Ivanti VPN products to operate their servers. Also, SKT has not identified that they are using Ivanti products. However, TeamT5 noted:  
  > *“Since April 2025, multiple devices have been compromised, where Ivanti VPN devices were leveraged in the attack.”*

Although SKT itself has not confirmed the use of Ivanti VPN products in its 4G/5G architecture, the first anomalous activity was detected by SKT’s incident response team on April 18, originating from a Linux-based charging analysis server located within a VPN route connected to the internet.

- **Web Shell**:  
  The committee suspected that the initial access might have been achieved via a web shell, as a web shell malware sample was identified during the second round of investigation.  

More importantly, the committee was unable to reconstruct the detailed initial access process because more than three years had passed since the attacker first compromised the entry point on August 6, 2021, and very few logs were available for analysis.  

### 2. Lateral Movement
  On Server A, employees had been storing access credentials in plain text for other maintenance servers, including Server B, which was connected to one of the core nodes, the HSS. Even more critically, the access credential for the HSS was also stored in plain text on Server B. As a result, the attacker successfully accessed the HSS on December 24, 2021, and installed BPFDoor.  

> For an explanation of what the HSS is, which nodes comprise the core network, and the difference between NSA and SA architectures, please see [this post](https://mango0727-github.github.io/josephjy.io/2025-08-23-SKTIncidentInitAssessmnt/).

### 3. Data Exfil.
Data collected in the HSS was exfiltrated through another infected server within the maintenance server network.  
During the multiple investigation, several malware samples were discovered, leading to the conclusion that these samples, including BPFDoor, were designed with a focus on persistence rather than self-deletion or covering their tracks.

# What's BPFDoor
> Detailed procedure is introduced in [here](https://www.msit.go.kr/bbs/view.do?sCode=user&mId=307&mPid=208&pageIndex=1&bbsSeqNo=94&nttSeqNo=3185964&searchOpt=ALL&searchTxt) and the architecture of EPC is explained in [this post](https://mango0727-github.github.io/josephjy.io/2025-08-23-SKTIncidentInitAssessmnt/), so we will focus on what's BPFDoor is.

BPF(Berkeley Packet Filter)Door is a type of backdoor especially designed for Linux, which is an obvious choice for the attacker, since most core network nodes today run on Linux.

...Working on it....
