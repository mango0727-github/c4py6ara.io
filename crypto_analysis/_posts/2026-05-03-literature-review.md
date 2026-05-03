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

## 1. Overview

본 논문은 AES에 대해 5-round distinguisher를 구성하고 이를 기반으로  
meet-in-the-middle (MitM) 공격을 통해 실제 key recovery를 수행한다.

핵심 아이디어는 다음과 같다:

- AES 내부 mapping은 완전히 random이 아님
- 특정 structured input에서 저차원 함수 공간에 제한됨
- 이를 이용해 key 후보를 filtering → 최종 key 복구

즉, 공격의 전체 흐름은 다음과 같다:

## Math
$$
\text{Key Recovery} = \text{Function Membership Test} + \text{Key Enumeration}
$$

---

## 2. Structural Insight: 5-Round Function Constraint

AES 4라운드 mapping:

## Math
$$
F: a_{11} \mapsto C_{11}^{(4)}
$$

이 함수는 다음 parameter로 결정된다:

## Math
$$
\theta \in \mathbb{F}_{2^8}^{25}
$$

따라서 함수 공간:

## Math
$$
|\mathcal{F}| \le 2^{200}
$$

반면 random 함수 공간:

## Math
$$
(2^8)^{2^8} = 2^{2048}
$$

즉:

## Math
$$
\Pr[\text{random function} \in \mathcal{F}] = 2^{-1848}
$$

이게 distinguisher의 수학적 핵심이다.

---

## 3. 5-Round Distinguisher

다음 linear combination을 정의한다:

## Math
$$
Y =
0E \cdot C_{11}^{(5)} +
0B \cdot C_{21}^{(5)} +
0D \cdot C_{31}^{(5)} +
09 \cdot C_{41}^{(5)}
$$

key term:

## Math
$$
k^{(5)} =
0E \cdot K_{11}^{(5)} +
0B \cdot K_{21}^{(5)} +
0D \cdot K_{31}^{(5)} +
09 \cdot K_{41}^{(5)}
$$

inverse S-box:

## Math
$$
Z = S^{-1}(Y + k^{(5)}) = C_{11}^{(4)}
$$

결론:

## Math
$$
a_{11} \mapsto Z \in \mathcal{F}
$$

---

## 4. Attack Structure

공격은 다음 3단계로 구성된다:

1. Precomputation
2. Key Candidate Filtering
3. Full Key Recovery

---

## 5. Precomputation Phase

모든 함수 생성:

## Math
$$
F_\theta(i), \quad i = 0, \dots, 255
$$

복잡도:

## Math
$$
2^{200} \cdot 2^8 = 2^{208}
$$

---

## 6. Key Candidate Filtering

### 6.1 Forward Guess (초기 라운드 키)

## Math
$$
K_{\text{init}} =
(K_{11}^{(0)}, K_{22}^{(0)}, K_{33}^{(0)}, K_{44}^{(0)}, K_{11}^{(1)})
$$

---

### 6.2 Backward Guess (마지막 라운드 키)

## Math
$$
K_{\text{final}} =
(K_{11}^{(7)}, K_{24}^{(7)}, K_{33}^{(7)}, K_{42}^{(7)}, k^{(6)})
$$

---

### 6.3 Partial Decryption

## Math
$$
C^{(7)} \rightarrow C_{11}^{(5)}
$$

Sequence:

## Math
$$
S = (C_{11}^{(5)}(i))_{i=0}^{255}
$$

---

### 6.4 Matching Condition

## Math
$$
S \in \mathcal{F}
$$

즉:

## Math
$$
\exists \theta \text{ s.t. } S = F_\theta
$$

---

### 6.5 의미

이 단계는 단순한 검증이 아니라:

## Math
$$
\text{Key Candidate Space} \rightarrow \text{Highly Reduced Subset}
$$

으로 줄이는 단계다.

---

## 7. Key Recovery (핵심)

여기서 중요한 부분이다.

### 7.1 surviving key 후보

matching 이후 남는 key 후보는 극히 적다.

확률적으로:

## Math
$$
\Pr[\text{false match}] = 2^{-1848}
$$

따라서 surviving key는 거의 실제 key이다.

---

### 7.2 추가 key byte 복구

논문은 다음을 반복한다:

## Math
$$
C_{11}^{(5)}, C_{21}^{(5)}, C_{31}^{(5)}, C_{41}^{(5)}
$$

각각에 대해 동일 공격 수행

→ 총 4번 수행

결과:

- 마지막 2라운드의 대부분 key byte 복구

---

### 7.3 Remaining Key Search

남은 key byte에 대해:

## Math
$$
\text{Exhaustive Search}
$$

수식적으로:

## Math
$$
K = (K_{\text{recovered}} \parallel K_{\text{remaining}})
$$

---

### 7.4 전체 Key Recovery 구조

전체 흐름:

$$
\begin{aligned}
\text{All Keys}
&\xrightarrow{\text{MitM filtering}}
\text{Small candidate set} \\
&\xrightarrow{\text{multi-target filtering}}
\text{Almost unique key} \\
&\xrightarrow{\text{exhaustive search}}
\text{Full key recovered}
\end{aligned}
$$

---

## 8. Complexity

## Math
Time (7-round) $$ \approx 2^{72} $$

## Math
Time (8-round AES-256) $$ \approx 2^{200} $$

## Math
Memory $$ \approx 2^{206} $$

## Math
Data $$ 2^{32} $$

---

## 9. 핵심 해석

이 공격의 본질은 다음이다:

### 기존 공격

## Math
$$
\text{Key Search} = \text{Brute Force}
$$

---

### 이 논문

## Math
$$
\text{Key Search} =
\text{Function Membership Filtering}
+ \text{Reduced Brute Force}
$$

---

즉:

## Math
$$
\text{Key Recovery} =
\text{Structure} + \text{Search}
$$

---

## 10. Conclusion

이 논문은 단순한 distinguisher 제시가 아니라  
실제 key recovery까지 가능한 공격 프레임워크를 완성한다.

핵심 기여:

1. AES 내부를 함수 공간으로 모델링
2. 그 공간이 극도로 제한됨을 보임
3. 이를 이용해 key 후보를 강력하게 filtering
4. 최종적으로 full key recovery 수행

결론적으로 이 공격은 다음으로 요약된다:

## Math
$$
\text{AES security} \Rightarrow \text{function space indistinguishability}
$$

그리고 이 논문은 그 가정을 부분적으로 깨는 구조를 보여준다.
