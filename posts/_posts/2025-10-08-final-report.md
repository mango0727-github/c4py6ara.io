---
layout: post
title: Intrusion Detection using Denoising Autoencoders and Deep Learning
description: >
  This post is to archive my project in 2023 with Siyuan Sim.
sitemap: false
hide_last_modified: true
---

## Introduction 
Due to the increasing dependence on the Internet in our social lives, it is ever more important
that proper cybersecurity methods are developed to reduce the harm of any security breaches.
There are many forms of cybersecurity methods, and the one that will be focused upon is
intrusion detection [1]. Intrusion detection is a process that monitors a system and checks
for any signs of malicious activity, and reports it. More importantly, intrusion detection
requires a time-sensitive reaction in order to minimize possible harm from intruders.

To tackle this problem, machine learning or deep learning methods have emerged as a solution.
The system would need to automatically detect anomaly behavior from real-time network
traffic and disseminates possible intruders to legitimate users once an intrusion is detected
[2], [3]. However, due to inherent characteristics of network traffic, in which there are errors
or noise stemming from various reasons, it is hard to achieve high accuracy in detecting
network attacks.

Therefore, in this project, we propose a classification scheme that combines the fully-connected
deep neural network with the stacked denoising autoencoder (SDAE), which finds a lower
dimensional representation from the original network traffic data that is more resilient to

noise. This would increase the accuracy of the intrusion detection system. [4] has also imple-
mented this idea before but he uses only the latent layer as the input to the classifier. This

is known as deep bottleneck. However, we are exploring using a technique known as deep
stack instead. The two techniques will be discussed about in the later sections.

## Dataset
In our work, we will be using the NSL-KDD (Network Security Laboratory - Knowledge
Discovery in Databases) dataset created in 2009 for intrusion detection, providing us with
a large number of network traffic records [5]. Each network traffic sample has 41 features
with a combination of categorical, binary, and numerical data types. Also, the dataset
has 22 different types of attacks but they can be categorized into 5 high-level labels that
are normal, Probe, DoS (denial of service), U2R (user-to-root), and R2L (remote-to-local)
attacks. Amongst them, the Probe attack is an attempt to gather information about a
target network for subsequent attacks. The U2R attack is an attempt to gain root access
to a system, and the R2L attack is an attempt to gain access to a local network (different from gaining root access) from a remote network. Lastly, DoS seeks to prevent users from
gaining access to their machine or network resources. The attacks in each category can be
observed in Table 1.
| DoS | Probe | R2L | U2R |
|-----|-------|-----|-----|
| neptune<br>smurf<br>back<br>teardrop<br>pod<br>land | satan<br>ipsweep<br>portsweep<br>nmap | warezclient<br>guess_passwd<br>warezmaster<br>imap<br>ftp_write<br>multihop<br>phf<br>spy | buffer_overflow<br>rootkit<br>loadmodule<br>perl |

**Table 1:** Categories of attack types in the NSL-KDD dataset.


The total number of samples in the dataset is 125,973 which we will split into a training and testing set with a 80-20 split. The labels for the entire set are distributed according to the following distribution (Table 2).

|      | Normal | Probe | DoS | U2R | R2L |
| --- | --- | --- | --- | --- | --- |
| Sample | 67,343 | 11,656 | 45,927 | 52 | 995 | 

**Table 2:** Example of a data point in the NSL-KDD data set.

An example of a data point in the NSK-KDD data set is shown below. It can be seen that there are different types data in the tabular data set and the data will be properly
preprocessed before being utilized. These steps will be discussed in the following sections.
| protocol type | service | flag | source bytes | destination bytes | land | wrong fragment | urgent | hot | . . . | label |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tcp | http | SF | 217 | 2032 | 0 | 0 | 0 | 0 | . . . | normal |

**Table 3:** Example of a data point in the NSL-KDD data set.


## Proposed system
For this project, we propose a scheme for detecting and classifying different types of intru-
sion in a network by combining the fully-connected deep neural network and the SDAE as

illustrated in Figure 1. First, after splitting the dataset into training and testing sets, we
will preprocess the entire dataset to be suitable to be used as inputs to our neural networks.
Next, we will stack both the preprocessed training and testing data into a single matrix and
feed it into the SDAE in order to train the SDAE to learn a lower dimensional representation
of the input data. Because the SDAE is an unsupervised learning algorithm, we can leverage
from both the training and testing set to train it. Then, we will encode only the training
data using the trained SDAE to train the classifier since the neural network is a supervised
algorithm. Lastly, we will then autoencode the testing data to be classified and to evaluate
the performance of the classifier and the entire system as a whole.

<img width="1056" height="654" alt="{F6301F48-B2AD-4FD7-AF19-B66B61280237}" src="https://github.com/user-attachments/assets/e3a527c2-2f07-4d71-892f-dea964a379e3" />


### Data preprocessing
The first preprocessing step is to first arrange the data based on their data types,

D =
h
c1 ... cC n1 ... nD b1 ...bB
i

where ci
, nj and bk are categorical, numerical and binary data columns respectively. This
allows us to keep track of the various features’ data type and use the appropriate loss function
during training. Then, the numerical data is normalized and the categorical data is one-hot
encoded. This gives a total of 122 features after data preprocessing.

### Stacked Denoising Autoencoder
The SDAE was first introduced in [6] as a form of unsupervised learning. The authors high-
light the SDAE is a straightforward variation of autoencoders by simply stacking multiply
layers of encoding and multiple layers of decoding. The encoding function transforms the
input data into a lower dimensional representation and then the decoding function attempts
to reconstruct the original input data from the hidden representations. Our encoder has
3 hidden layers with 128, 64 and 32 neurons respectively and its training process can be
observed in Figure 2.

During training, noise is added into the input data to prevent the autoencoder from learning
the identity function which makes the hidden representations redundant. There are many
ways to introduce noise into a dataset, but for our work we decided on utilizing batch swap
noise for applying noise to our tabular dataset [7]. This noise generator method randomly
swaps a data point with another data point in the same column in a data matrix. This is
because we cannot add noise from a Gaussian distribution to the categorical or binary data
in our dataset. Hence, batch swap noise is the best choice as it can be used for every data
type. Not only that, but it is also computationally cheap since it is just swapping data and
serves the purpose of introducing noise into the dataset. As an example, our swap noise can
be represented as,

where ci,j
, bi,j
, and ni,j are categorical, binary, and numerical data, respectively, for i =
1,...,8. C,B, and D are the total number of categorical, binary, and numerical features,
respectively.

When computing the loss of the SDAE, different loss functions are employed depending on
the data type as we cannot use mean-square error for the entire dataset. For binary data,
binary cross entropy is used,

where N is the total number of samples. As for categorical data, cross entropy is utilized
instead,

where yi j is 1 if true category class for observation i is j, else it is 0. Lastly, mean-square
error is used for numerical data,

where yi

is the reconstructed input and xi

is the original input without noise added. The

total loss is then the averaged loss from each loss function,

Once the SDAE is trained, we will discard the reconstruction head of the autoencoder since
we will only be using the hidden representations from the encoder for classification. The
implementation of the SDAE is obtained from the Github repository of [8] and modified to
be suitable for our application. The file titled nslkdd.pdf is the main notebook containing
the top level code. The rest of the files are the codes from the Github repository.

### Neural network classifier
After training the SDAE, the hidden representations from the autoencoder is obtained and
then fed as inputs into the classifier for classification. The classifier is a deep neural network
with 5 fully connected (dense) hidden layers with rectified linear unit (ReLU) activation
functions after each layer.
f (x) = max(0,x)
As a result, there are 928,005 parameters that will be tuned for the purpose of classifying the
input data for intrusion detection and determining the type of attack. Not only that, but
dropout is also utilized where some of the inputs from the input layer is ignored to prevent
overfitting. Lastly, a softmax layer is used at the output of the neural network only after
training to convert the outputs into a probability for classification.

The deep stack technique is also utilized where the output of each layer in the autoencoder
is used and stacked into a single vector and then fed into the classifier. This is to take
advantage of the autoencoder and leverage all of the learnt information from the encoding
process. Because the autoencoder has 3 layers of encoding with output vectors of lengths
128, 64 and 32, the new vector’s length is therefore 224 elements long. There are quite a
few hyperparameters in the classifier that can be tuned in the system that are the number
of layers, the dropout percentage and number of neurons in each layer. The architecture of
the neural network is illustrated in Figure 3.


## Results

The proposed system with the SDAE and neural network classifier is evaluated on a laptop
with an AMD Ryzen 5 3500U CPU and 8GB of RAM. The training of the autoencoder and
the classifier can be observed in the figure below. It can be seen that due to the lack of a
GPU, the training time is rather long especially for the SDAE that takes more than 1 hour
to train. However, with a setup possessing a GPU dedicated to training neural networks,
the training time can be significantly shorter as both the autoencoder and classifiers are
neural networks. This allows them to take advantage of the parallel computation that a
GPU provides which will reduce the training time to more reasonable numbers.


A baseline model is also created that consists of just the neural network classifier with the
same parameters to test the efficacy of the SDAE. After training both models, both are
evaluated with the same number of test data points and the confusion matrix for both can
be seen models can be seen below. Without the SDAE, the accuracy of the classifier is only
around 92.46%. However, when the SDAE is utilized, we are able to obtain accuracies of
around 99%. This shows that the encoding function allows for better feature extraction for
higher precision in the classification task.


Another comparison is also made between the deep stack and the deep bottleneck technique.
The deep bottleneck technique only uses the output of the last encoding layer unlike the
deep stack technique which uses every output layer. The same neural network is used again
and the confusion matrix for the deep bottleneck technique is shown below. It can be
seen that it also performs very well with the accuracy being only 0.5% lower. However,
because the autoencoder architecture remains the same, the deep stack technique shows
better performance and is already readily available so it should be the default method of
utilizing the hidden representations of the SDAE.


## Conclusion

In conclusion, the SDAE provides a good way to extract feature representation of a dataset in
an unsupervised manner without needing to conduct feature engineering manually. However,
training and maintaining a robust SDAE requires a large sample size and will take a long
time to train as evident through this project. But it does provide good results and is able
to find how features interact with one another through the encoding process. The main
flaw with autoencoders in general is that it tends to break apart if it encounters new feature
interactions that it is not trained on. And this is key because this means that it will not work
on zero-day attacks where the attack methods are unknown to the autoencoder. It might
not understand the new feature interactions that the attack is based upon which causes the
system to fail.

## References
[1] D. E. Denning, “An intrusion-detection model,” IEEE Transactions on software engineering,
no. 2, pp. 222–232, 1987.
[2] I. H. Sarker, A. Kayes, S. Badsha, H. Alqahtani, P. Watters, and A. Ng, “Cybersecurity data
science: An overview from machine learning perspective,” Journal of Big data, vol. 7, pp. 1–
29, 2020.
[3] G. Apruzzese, M. Colajanni, L. Ferretti, A. Guido, and M. Marchetti, “On the effectiveness of
machine and deep learning for cyber security,” in 2018 10th international conference on
cyber Conflict (CyCon), IEEE, 2018, pp. 371–390.
[4] I. Lopes, D. Zou, A. Ihsan, F. Ruambo, B. Yuan, and H. Jin, “Effective network intrusion

detection via representation learning: A denoising autoencoder approach,” Computer Com-
munications, vol. 194, pp. 55–65, 2022.

[5] “Nsl-kdd dataset.” Accessed on May, 2023. (), [Online]. Available: http://nsl.cs.unb.ca/
nsl-kdd/.

[6] P. Vincent, H. Larochelle, I. Lajoie, Y. Bengio, P.-A. Manzagol, and L. Bottou, “Stacked denois-
ing autoencoders: Learning useful representations in a deep network with a local denoising

criterion.,” Journal of machine learning research, vol. 11, no. 12, 2010.
[7] Porto seguro’s safe driver prediction, Accessed on May, 2023, 2018. [Online]. Available: https:
//www.kaggle.com/c/porto-seguro-safe-driver-prediction/discussion/44629.
[8] R. Zhang, Denoise autoencoder for tabular data, version 0.2, 2021. [Online]. Available: https:
//github.com/ryancheunggit/tabular_dae.
