---
layout: post
title: Useful Tools for Enum
description: >
  Tools to enumerate directories and subdomains and to check if they are alive.
sitemap: false
---

# Recon Process

## Directory Enumeration Tools

### ffuf

`ffuf` is a tool that fuzzes directory under a certain domain based on a wordlist


`ffuf` is a directory fuzzing tool that uses a wordlist to discover hidden paths on a target domain. It sends HTTP requests and classifies results based on the response.

- `-w`: pick your wordlist  
    
    ```bash
    ┌──(kali㉿kali)-[~/bb-course/bugbounty]
    └─$ ls /usr/share/wordlists/dirbuster/   
    apache-user-enum-1.0.txt  directories.jbrofuzz    directory-list-2.3-medium.txt  directory-list-lowercase-2.3-medium.txt
    apache-user-enum-2.0.txt  directory-list-1.0.txt  directory-list-2.3-small.txt   directory-list-lowercase-2.3-small.txt
    ```
    
- `-u`: set the target URL, replace the fuzzing spot with `FUZZ`  
- `-H`: add HTTP headers  
- `-rate`: control requests per second  
- `-t`: number of threads  
- `--recursive` & `--recursion-depth`: explore subdirectories automatically  

**Example**:  

```bash
ffuf -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
     -u https://t-mobile.com/FUZZ \
     -H "X-Bug-Bounty:BugCrowd-Joseph_djy" \
     -H "Cookie: sessionid=your_session_cookie_here;" \
     -rate 5 \
     -t 1
```


## Subdomain Enumeration

### subfinder

Passive subdomain finder (OSINT-based, no requests sent to the target).

| Type | Explain |
| --- | --- |
| **Input option** | `-d` 단일 도메인 / `-dL` 다중 도메인 파일 입력 |
| **Source setting** | `-s` 특정 소스 선택 / `-all` 모든 소스 사용 / `-es` 제외 소스 설정 |
| **Recursive option** | `-recursive`로 `sub.sub.example.com`까지 추적 (가능한 소스에 한함) |
| **Speed** | `-rl` 요청 속도 제한 / `-t` 동시 처리 스레드 수 설정 |
| **Filtering** | `-m`, `-f` 서브도메인 정규식 매칭 및 필터링 |
| **Output format** | `-o` 일반 출력 / `-oJ` JSONL / `-oI` IP 포함 / `-oD` 디렉토리 지정 |
| **Config file** | `-config` 메인 설정 / `-pc` API provider 설정 (Shodan, Censys 등) |
| **Debug** | `-v` verbose / `-silent` 최소 출력 / `-ls` 전체 소스 리스트 출력 |

### assetfinder

Built by tomnomnom — super quick passive tool.

### amass

Big recon framework from OWASP(Open Web Application Security Project) — does passive, active, brute forcing, ASN/Net collection, and even graph DB visualization.

| Functionality | Explain |
| --- | --- |
|  Passive collection | 패시브 소스로부터 서브도메인 수집  |
|  Active collection | DNS 레졸빙을 통한 액티브 탐지 |
|  Brute Forcing | 워드리스트를 통한 서브도메인 강제열거 |
|  Recursive search | 하위 도메인에 대한 재탐색 수행 |
|  ASN & IP collection | ASN, IP range 기반 네트워크 수집 |
|  Graph DB | 서브도메인 관계를 네오4j 또는 Graphviz로 시각화 가능 |
|  통합 기능 | `enum`, `intel`, `track`, `viz`, `db` 등 서브 명령 제공 |

### Comparison

| 구분 | assetfinder | subfinder | amass |
| --- | --- | --- | --- |
| Collection type | Passive only | Passive/Active | Passive/Active/Brute |
| Speed | 매우 빠름 | 빠름 | 느림 (정확도 높음) |
| Accuracy | 낮음~중간 | 중간~높음 | 매우 높음 |

### Tips

필요에 따른 툴을 활용하여 output 파일 생성 후 `grep t-mobile | sort -u` 등으로 중복제거 후 httprobe를 통해 실제로 http 혹은 https 서비스를 제공하는지 확인한다. 이후 gowitness로 웹사이트가 실제로 서비스를 제공하는지 스크린샷 및 저장하여 자동화할 수 있다.

**httprobe과 함께 사용하는 예시**

1. 서브도메인 확인 (파이프 입력)

```bash
cat domains.txt | httprobe
```

→ `domains.txt`에 있는 모든 도메인에 대해:

- `http://<domain>`
- `https://<domain>`
    
    을 확인하고, 접속 가능한 URL만 출력
    
1. 커스텀 포트 스캔

```bash
cat domains.txt | httprobe -p http:81 -p https:8443
```

→ 81번과 8443번 포트도 스캔

1. https 우선 탐색

```bash
cat domains.txt | httprobe -prefer-https
```

1. 타임아웃 설정 (초 단위)

```bash
cat domains.txt | httprobe -t 10000
```

→ 타임아웃을 10초로 설정

**내부 동작**

1. stdin으로 입력된 도메인 리스트를 읽음
2. 각 도메인에 대해 `http://`, `https://` URL을 조합
3. 각 조합에 대해 HTTP 요청 시도
4. 200~500번대 응답을 받는다면 "접속 가능"으로 판단
5. 결과를 표준 출력(stdout)에 표시 → 내부적으로 Go의 `net/http` 패키지로 요청을 보내고, 응답 여부를 기반으로 판단.

### **httpx가 좀 더 최신버전이라 함께 적어본다**

| 항목 | `httpx` | `httprobe` |
| --- | --- | --- |
| 목적 | 고급 HTTP 프로빙  | 간단한 라이브 도메인 확인 |
| 지원 프로토콜 | HTTP/HTTPS, HTTP/2, HTTP/3, FTP, TLS 등 | HTTP/HTTPS |
| 출력 정보 | 응답 코드, 제목(title), IP, 서버명, TLS, CDN, 등등 | 응답 여부만 |
| 병렬성 설정 | `-c`로 커넥션 수 조절 가능 | ❌ 제한적 (`-c` 없음) |
| 스크립트화 용이성 | 다양한 출력 포맷 (JSON, CSV, grep 등) | 매우 단순, 빠름 |
| 기능 확장성 | 매우 높음 (fingerprint, status code filter 등) | 낮음 (기본 기능만) |

**주요 httpx 플래그 설명**

| 옵션 | 설명 |
| --- | --- |
| `-silent` | 도메인만 출력 (노이즈 제거) |
| `-ip` | 도메인의 IP 표시 |
| `-title` | 웹사이트 title 태그 추출 |
| `-status-code` | HTTP 상태코드 표시 |
| `-location` | 리다이렉션 위치 표시 |
| `-web-server` | 웹 서버 정보 표시 (nginx, Apache 등) |
| `-tech-detect` | JS, CMS, 프레임워크 등 기술 스택 표시 |
| `-cdn` | CDN 사용 여부 표시 |
| `-cname` | CNAME 정보 표시 |
| `-ports 80,443,8080,8443` | 포트 지정 가능 |
| `-o output.txt` | 결과 파일 저장 |

**httprobe**

```bash
cat subdomains.txt | httprobe -prefer-https
```

결과

```
https://admin.example.com
http://dev.example.com
```

**httpx**

```bash
cat subdomains.txt | httpx -silent -title -status-code -ip
```

결과

```bash
https://admin.example.com [200] [Admin Portal] [192.0.2.4]
http://dev.example.com [403] [403 Forbidden] [192.0.2.7]
```

**gowitness과 함께 사용하는 예시**

gowitness는 웹 페이지의 스크린샷을 자동으로 캡처하고, 웹 자산에 대한 정보 수집을 해주는 도구임. chromedp(Headless Chrome 기반)를 활용하여 실제 페이지 렌더링 결과를 수집하는 것이 특징.

```bash
subfinder -d t-mobile.com -silent | \
httprobe -prefer-https | \
tee alive.txt | \
gowitness file -f alive.txt
```

## 전체 Recon 워크플로우 예시

### Subdomain 수집

```bash
subfinder -d t-mobile.com -silent > subs.txt
assetfinder --subs-only t-mobile.com >> subs.txt
amass enum -passive -d t-mobile.com >> subs.txt
sort -u subs.txt > all_subs.txt
```

### httpx로 Live 도메인 필터링

```bash
cat all_subs.txt | httpx -silent -ip -cname -title -tech-detect -status-code -location -web-server -fr -cdn -o live_hosts.txt
```

### FFUF로 디렉토리/엔드포인트 추측

```bash
ffuf -w /usr/share/seclists/Discovery/Web-Content/common.txt -u https://target.com/FUZZ -mc all -t 5 -rate 5
```

### Nuclei로 취약점 자동 스캔

```bash
cat live_hosts.txt | nuclei -t cves/ -t vulnerabilities/ -t misconfiguration/ -severity high,critical -o nuclei_results.txt
```

- `-t`: 사용할 template 디렉토리
- `-severity`: 위험도 필터링
- `-o`: 결과 저장

### Gowitness로 스크린샷

```bash
gowitness file -f live_hosts.txt -P screenshots/
```

- `-f`: URL 목록 파일
- `-P`: 저장할 디렉토리

### 전체 워크플로 자동화 예시

```bash
domain="t-mobile.com"

# 1. 수집
subfinder -d $domain -silent > subs.txt
assetfinder --subs-only $domain >> subs.txt
amass enum -passive -d $domain >> subs.txt
sort -u subs.txt > all_subs.txt

# 2. 라이브 확인
cat all_subs.txt | httpx -silent -ip -title -status-code -tech-detect -web-server -cdn -o live_hosts.txt

# 3. 취약점 자동 스캔
cat live_hosts.txt | nuclei -t cves/ -severity high,critical -o nuclei.txt

# 4. 스크린샷
gowitness file -f live_hosts.txt -P screenshots/
```

## 번외: nuclei

nuclei는 템플릿 기반의 취약점 탐지 도구로, HTTP 요청을 전송하고 돌아오는 응답 메시지와 기 존재하는 CVE, misconfig 등 각각의 yaml 템플릿을 상호 비교하여 취약점을 탐지하는 도구임. 이 과정은 아마도 정찰과정의 제일 마지막에 수행되어야 할 것이다. 즉, 서브도메인을 탐색하고, 살아있는 서브도메인을 찾으면 해당 서브도메일을 대상으로 디렉토리를 탐색한 뒤에 취약점 탐색을 시도해야하는 것이다.

### 예시 (CVE-2021-12345 탐지용 템플릿)

```yaml
id: example-cve

info:
  name: Sample Vulnerability
  severity: high
  tags: cve,rce

requests:
  - method: GET
    path:
      - "{{BaseURL}}/vulnerable/endpoint"
    matchers:
      - type: word
        words:
          - "Vulnerable Response"
```

### **URL 대상에 템플릿 실행**

- `nuclei -l urls.txt -t cves/`처럼 실행하면,
    1. urls.txt에 있는 각 URL에 대해
    2. `cves/` 디렉토리에 있는 모든 템플릿을 적용하여
    3. 각 템플릿별 요청을 해당 URL로 보냄

### **요청 결과 분석**

- 템플릿의 matchers, extractors, status, headers 등의 조건에 맞는지 판단
- 조건 충족 시 취약점으로 판단하여 결과 출력

### 주요 기능 플래그 예시

| 옵션 | 설명 |
| --- | --- |
| `-l` | 대상 URL 리스트 지정 |
| `-t` | 템플릿 디렉토리 지정 |
| `-severity` | 탐지할 취약점 심각도 필터 (low, medium, high, critical) |
| `-o` | 결과 출력 파일 |
| `-tags` | 특정 태그 필터 (e.g., `-tags rce,xss`) |
| `-rate-limit` | 초당 요청 수 제한 |
| `-headless` | Headless 브라우저 기반 탐지 (e.g., JS 기반 탐지) |

### 핵심 디렉토리 구성

| 디렉토리 | 설명 |
| --- | --- |
| `cves/` | CVE 기반 취약점 |
| `exposures/` | 노출된 서비스 (e.g., `.git`, `.env`, 패널 등) |
| `vulnerabilities/` | 일반적인 웹 취약점 (e.g., SQLi, XSS) |
| `technologies/` | 서버 소프트웨어, 기술 식별 |
| `misconfiguration/` | 잘못된 서버 설정 탐지 |

### 사용 예시

```bash
nuclei -l live_hosts.txt -t cves/ -severity high,critical -o high_findings.txt
```

> 위 명령은 live_hosts.txt의 모든 URL에 대해 CVE 관련 템플릿을 실행하고, high/critical 취약점만 탐지하여 high_findings.txt에 저장
>
