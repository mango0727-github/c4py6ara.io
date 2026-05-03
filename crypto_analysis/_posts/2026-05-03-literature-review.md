---
layout: post
title: A Meet-in-the-Middle Attack on 8-Round AES
description: >
  This post reviews a paper: a MITM on 8-round AES
sitemap: false
categories: [crypto_analysis]
hide_last_modified: true
---


# [Paper Review] A Meet-in-the-Middle Attack on 8-Round AES — Technical and Mathematical Perspective

논문: A Meet-in-the-Middle Attack on 8-Round AES
저자: H. Demirci, A. A. Selçuk  

---

## 1. Introduction

본 논문은 AES에 대한 구조 기반 암호분석의 한 사례로, 기존 square attack 계열을 확장하여 5-round distinguisher를 구성하고 이를 기반으로 meet-in-the-middle (MitM) 공격을 설계한다.

핵심 목표는 다음과 같다:

- AES 내부 상태가 완전히 랜덤이 아니라는 점을 수학적으로 보이는 것
- 그 구조를 이용해 reduced-round AES에 대해 키 탐색을 효율화하는 것

이 논문은 실제 AES를 깨는 것이 아니라,  
AES 내부 구조의 "저차원 표현 가능성"을 이용한 공격 프레임워크를 제시하는 데 의의가 있다.

---

## 2. Background: Square Property and Structural Constraints

AES는 다음과 같은 구조를 갖는다:

\[
S \in \mathbb{F}_{2^8}^{4 \times 4}
\]

연산은 다음과 같이 구성된다:

- SubBytes: \( S(x) \)
- ShiftRows: permutation
- MixColumns: 선형 변환 \( M \)
- AddRoundKey: XOR

AES의 중요한 특성 중 하나는 2라운드 이후 full diffusion이다.
그러나 square attack에서 알려진 바와 같이, 특정 입력 구조에서는 다음 성질이 성립한다:

\[
\sum_{i=0}^{255} C^{(3)}_{jk}(i) = 0
\]

이는 AES가 완전히 랜덤 permutation이 아니라 특정 algebraic structure를 가진다는 것을 의미한다.

---

## 3. Core Contribution: 5-Round Distinguisher

### 3.1 Problem Setting

다음과 같은 plaintext 집합을 고려한다:

\[
P_i = (a_{11} = i, \text{others fixed}), \quad i \in \mathbb{F}_{2^8}
\]

이 집합은 다음 성질을 갖는다:

- \(a_{11}\): active
- 나머지 15개 바이트: passive

---

### 3.2 Functional View of AES

논문은 AES를 다음과 같이 함수로 본다:

\[
F: a_{11} \mapsto C_{11}^{(r)}
\]

특히 \(r = 4\)일 때, 이 함수는 매우 중요한 구조를 가진다.

---

### 3.3 4-Round Functional Representation

논문의 핵심 결과:

\[
C_{11}^{(4)} = F(a_{11}; \theta)
\]

여기서:

\[
\theta \in \mathbb{F}_{2^8}^{25}
\]

즉, 4라운드 AES 출력은 단 25바이트 파라미터로 결정된다. :contentReference[oaicite:1]{index=1}  

이를 구체적으로 보면:

\[
\begin{aligned}
C_{11}^{(4)} =
&\; 2S(C_{11}^{(3)}) + 3S(C_{22}^{(3)}) \\
&+ S(C_{33}^{(3)}) + S(C_{44}^{(3)}) + K_{11}^{(4)}
\end{aligned}
\]

그리고 각 \(C_{ii}^{(3)}\)는 다음 형태로 표현된다:

\[
C_{ii}^{(3)} = f_i(a_{11}, c_1, \dots, c_{20}, K^{(3)})
\]

중요한 점은:

- 모든 diagonal term이 같은 일부 파라미터를 공유
- 결과적으로 전체 함수가 저차원 공간으로 collapse

---

### 3.4 Dimensionality Reduction

일반적으로 함수:

\[
f: \mathbb{F}_{2^8} \to \mathbb{F}_{2^8}
\]

의 개수는:

\[
(2^8)^{2^8} = 2^{2048}
\]

하지만 AES의 경우:

\[
|\mathcal{F}| \le 2^{200}
\]

따라서:

\[
\Pr[f_{\text{random}} \in \mathcal{F}] = 2^{-1848}
\]

이 극단적인 차이가 distinguisher의 기반이다.

---

## 4. Extending to 5 Rounds

5라운드에서는 inverse 연산을 통해 다음을 얻는다.

### 4.1 Linear Combination

\[
Y =
0E \cdot C_{11}^{(5)} +
0B \cdot C_{21}^{(5)} +
0D \cdot C_{31}^{(5)} +
09 \cdot C_{41}^{(5)}
\]

---

### 4.2 Key Separation

\[
Y + k^{(5)}
\]

\[
k^{(5)} =
0E \cdot K_{11}^{(5)} +
0B \cdot K_{21}^{(5)} +
0D \cdot K_{31}^{(5)} +
09 \cdot K_{41}^{(5)}
\]

---

### 4.3 Inversion

\[
Z = S^{-1}(Y + k^{(5)}) = C_{11}^{(4)}
\]

결론:

\[
a_{11} \mapsto Z \in \mathcal{F}
\]

즉, 5라운드 AES도 여전히 동일한 제한된 함수 공간을 따른다.

---

## 5. Attack Construction

### 5.1 Precomputation Phase

모든 \(\theta \in \mathbb{F}_{2^8}^{25}\)에 대해:

\[
F_\theta(i), \quad i = 0, \dots, 255
\]

계산 및 저장.

복잡도:

\[
2^{200} \cdot 2^8 = 2^{208}
\]

---

### 5.2 Online Phase

#### (1) Forward Guess

\[
K_{\text{init}} = (K_{11}^{(0)}, K_{22}^{(0)}, K_{33}^{(0)}, K_{44}^{(0)})
\]
\[
K_{11}^{(1)}
\]

---

#### (2) Backward Guess

\[
K_{11}^{(7)}, K_{24}^{(7)}, K_{33}^{(7)}, K_{42}^{(7)}, k^{(6)}
\]

---

#### (3) Partial Decryption

\[
C^{(7)} \rightarrow C_{11}^{(5)}
\]

256개 시퀀스 생성:

\[
S = (C_{11}^{(5)}(i))_{i=0}^{255}
\]

---

#### (4) Matching

\[
S \in \mathcal{F}
\]

즉:

\[
\exists \theta \text{ s.t. } S = F_\theta
\]

---

## 6. Complexity Analysis

### Time

\[
2^{72} \quad (\text{7-round})
\]

\[
2^{200} \quad (\text{8-round AES-256})
\]

---

### Memory

\[
\approx 2^{206} \text{ blocks}
\]

---

### Data

\[
2^{32} \text{ chosen plaintexts}
\]

---

## 7. Optimization: XOR Trick

다음 변환을 사용:

\[
S(F(i)) \oplus S(F(0))
\]

효과:

- \(k^{(5)}\) 제거
- key guess space 감소
- complexity 감소 (\(2^8\))

---

## 8. Discussion

### 8.1 Why This Works

이 공격은 AES의 다음 약점을 이용한다:

- 높은 diffusion에도 불구하고
- 특정 structured input에 대해
- 내부 상태가 low-dimensional manifold에 존재

즉:

\[
\text{AES} \neq \text{random permutation}
\]

---

### 8.2 Limitation

- 메모리: \(2^{206}\)
- precomputation: \(2^{208}\)
- practical infeasibility

---

### 8.3 Research Significance

이 논문의 핵심 기여는 다음과 같다:

1. AES 내부 구조를 함수 공간 관점에서 분석
2. distinguisher를 function-level constraint로 확장
3. MitM을 "function membership test"로 재해석

---

## 9. Conclusion

이 논문은 AES의 구조적 특성을 이용해 reduced-round 공격을 설계한 대표적인 연구이다.

핵심 메시지는 다음과 같다:

\[
\text{AES 내부는 완전히 랜덤이 아니라 구조적 제약을 가진다}
\]

그리고 이 구조는:

\[
\text{key recovery problem} \rightarrow \text{function membership problem}
\]

으로 변환될 수 있다.

이러한 관점은 이후 암호분석에서 매우 중요한 방향성을 제공한다.
