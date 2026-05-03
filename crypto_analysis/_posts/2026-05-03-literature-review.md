---
layout: post
title: A Meet-in-the-Middle Attack on 8-Round AES
description: >
  This post reviews a paper: a MITM on 8-round AES
sitemap: false
categories: [crypto_analysis]
hide_last_modified: true
---

# [Paper Review] A Meet-in-the-Middle Attack on 8-Round AES
논문: A Meet-in-the-Middle Attack on 8-Round AES
저자: H. Demirci, A. A. Selçuk  

---

## 1. 리뷰 개요

이 논문은 AES에 대한 기존 cryptanalysis 흐름에서 한 단계 진화된 접근을 제시한다.  
핵심은 단순히 differential이나 square property를 사용하는 것이 아니라,  
AES 내부를 **함수 공간(function space)**으로 바라보고 그 구조적 제약을 이용한다는 점이다.

결과적으로 이 논문은 다음을 수행한다:

- 5-round distinguisher 제시
- 이를 기반으로 meet-in-the-middle 공격 설계
- 실제 key recovery까지 이어지는 공격 구성

중요한 점은, 이 공격이 AES를 깨는 것이 아니라  
**AES 내부가 얼마나 “비랜덤적인 구조”를 가지는지를 보여준다**는 데 있다.

---

## 2. 기존 연구와의 차별점

AES 분석의 주요 흐름은 다음과 같다:

- square attack: 구조 기반 (balanced property)
- differential/linear: 통계 기반
- impossible differential: 경로 기반

이 논문은 완전히 다른 관점을 취한다:

> AES 내부 mapping을 하나의 함수로 보고, 그 함수가 속한 공간을 분석한다.

즉, 공격 대상은 key가 아니라 다음이다:

## Math
$$
F: a_{11} \mapsto C_{11}^{(r)}
$$

이 함수가 random인지 아닌지를 판단하는 것이 핵심이다.

---

## 3. 핵심 아이디어: 함수 공간의 붕괴

논문의 가장 중요한 insight는 다음 한 줄로 정리된다:

> AES 4라운드 mapping은 2048비트 자유도를 가지지 않는다.

이를 수식으로 보면:

## Math
$$
f: \mathbb{F}_{2^8} \to \mathbb{F}_{2^8}
$$

가능한 함수 수는:

## Math
$$
(2^8)^{2^8} = 2^{2048}
$$

하지만 AES의 경우:

## Math
$$
|\mathcal{F}| \le 2^{200}
$$

즉:

## Math
$$
\frac{2^{200}}{2^{2048}} = 2^{-1848}
$$

이 의미는 매우 강력하다.

- AES 내부 mapping은 거의 deterministic structure를 가진다
- random function과 비교하면 극도로 작은 subset에 속한다

이것이 바로 distinguisher의 수학적 본질이다.

---

## 4. 왜 이런 현상이 발생하는가?

이 부분이 논문의 기술적 핵심이다.

AES는 strong diffusion을 가지지만, 다음 특성이 존재한다:

- MixColumns는 선형 변환
- S-box는 비선형이지만 입력 구조에 따라 correlation 유지
- diagonal path에서 parameter sharing 발생

결과적으로 다음과 같은 현상이 발생한다:

- 서로 다른 경로의 intermediate 값들이 독립적이지 않음
- 일부 constant들이 여러 경로에서 공유됨
- 전체 표현이 **25개의 byte parameter로 collapse**

이것은 일종의 “low-rank representation”으로 볼 수 있다.

---

## 5. 5-Round Distinguisher의 의미

논문은 이 구조를 5라운드까지 확장한다.

핵심 연산은 inverse MixColumns 기반 linear combination이다:

## Math
$$
Y =
0E \cdot C_{11}^{(5)} +
0B \cdot C_{21}^{(5)} +
0D \cdot C_{31}^{(5)} +
09 \cdot C_{41}^{(5)}
$$

그리고:

## Math
$$
Z = S^{-1}(Y + k^{(5)})
$$

이때:

## Math
$$
Z = C_{11}^{(4)}
$$

즉, 5라운드 출력에서 다시 4라운드 구조로 돌아간다.

이 의미는 다음과 같다:

> 5라운드 AES조차 여전히 25-byte 함수 공간 제약을 유지한다.

---

## 6. 공격 설계: MitM + Function Matching

이제 이 구조를 실제 공격으로 연결한다.

### 핵심 전략

1. 가능한 모든 함수 \(F_\theta\)를 미리 계산
2. 실제 암호문에서 partial decryption 수행
3. 결과 sequence가 해당 함수 공간에 속하는지 확인

즉, 공격은 다음 문제로 환원된다:

## Math
$$
\text{Given } S,\quad S \in \mathcal{F} \; ?
$$

이는 단순한 비교가 아니라:

> function membership test

이다.

---

## 7. Key Recovery 과정

이 논문에서 중요한 부분은 단순 distinguisher가 아니라  
**실제 key recovery까지 이어진다는 점**이다.

### 7.1 Key 후보 필터링

앞쪽과 뒤쪽 key를 일부 guess하고:

- forward computation
- backward partial decryption

을 수행한다.

그 후:

## Math
$$
S \in \mathcal{F}
$$

조건을 만족하는 key만 남긴다.

이 과정은 brute force와 본질적으로 다르다:

## Math
$$
\text{Key Space} \rightarrow \text{Filtered Key Space}
$$

---

### 7.2 왜 filtering이 강력한가?

false positive 확률:

## Math
$$
2^{-1848}
$$

즉:

- 잘못된 key가 살아남을 확률은 사실상 0
- surviving key는 거의 정답

---

### 7.3 전체 key 복구

공격은 한 번으로 끝나지 않는다.

논문은 다음을 반복한다:

- 다른 state byte를 target으로 설정
- 동일한 공격 수행

이를 통해:

- 마지막 라운드 key 대부분 복구
- 이후 남은 key는 exhaustive search

결과적으로:

## Math
$$
K = K_{\text{recovered}} \cup K_{\text{remaining}}
$$

---

## 8. Complexity 평가

이 공격의 특징은 다음과 같다:

- Time: \(2^{72}\) (7-round)
- Time: \(2^{200}\) (8-round AES-256)
- Memory: \(2^{206}\)
- Precomputation: \(2^{208}\)

즉, 계산적으로는 brute force보다 빠르지만  
메모리와 precomputation이 매우 크다.

---

## 9. 논문의 의미 (Critical Insight)

이 논문의 진짜 가치는 공격 자체가 아니다.

핵심은 다음 insight다:

> AES는 strong cipher이지만, 내부는 완전히 random하지 않다.

그리고 더 중요한 해석:

> AES 내부 구조는 high-dimensional random object가 아니라  
> low-dimensional structured object이다.

이 관점은 이후 연구에서 매우 중요하다.

---

## 10. 한계

이 공격의 한계는 명확하다:

- 현실적으로 불가능한 메모리 요구
- reduced-round에만 적용
- chosen plaintext 필요

따라서 practical attack은 아니다.

---

## 11. 결론

이 논문은 AES를 깨는 논문이 아니다.  
대신 다음을 보여준다:

## Math
$$
\text{AES internal mapping} \subset \text{restricted function space}
$$

그리고 이를 이용해:

## Math
$$
\text{Key Recovery} =
\text{Function Filtering} + \text{Reduced Search}
$$

이라는 새로운 cryptanalysis 패러다임을 제시한다.

이것이 이 논문의 핵심 기여다.
