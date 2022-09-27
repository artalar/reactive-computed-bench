This benchmark measured computation of complex computed reactive unit when it deep children change.

## Results

### Apple m1

#### Median of computers creation and linking from 5 iterations
(UNSTABLE)

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| usignal         | 100   | 0.018  | 0.00596 | 0.01754 | 0.27892 |
| cellx           | 73    | 0.024  | 0.02296 | 0.02400 | 0.52583 |
| wonka           | 69    | 0.025  | 0.01979 | 0.02537 | 0.36292 |
| s.js            | 52    | 0.033  | 0.01154 | 0.03342 | 0.25258 |
| solid           | 51    | 0.034  | 0.02192 | 0.03429 | 0.25067 |
| preact          | 24    | 0.072  | 0.01008 | 0.07183 | 2.95158 |
| reatom          | 24    | 0.074  | 0.02342 | 0.07363 | 0.60929 |
| mol             | 23    | 0.076  | 0.01821 | 0.07642 | 0.48746 |
| whatsup         | 22    | 0.081  | 0.02183 | 0.08113 | 0.41917 |
| effector (fork) | 14    | 0.122  | 0.11675 | 0.12225 | 0.24967 |
| mobx            | 13    | 0.133  | 0.09383 | 0.13267 | 1.20696 |
| effector        | 5     | 0.383  | 0.12238 | 0.38258 | 1.53408 |

#### Median on one call in ms from 10 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| s.js            | 100   | 0.010  | 0.00646 | 0.01042 | 0.05862 |
| usignal         | 97    | 0.011  | 0.00700 | 0.01073 | 0.01929 |
| preact          | 96    | 0.011  | 0.00704 | 0.01085 | 0.09054 |
| whatsup         | 67    | 0.016  | 0.01146 | 0.01552 | 0.09692 |
| solid           | 62    | 0.017  | 0.01087 | 0.01688 | 0.02646 |
| mol             | 61    | 0.017  | 0.01271 | 0.01706 | 0.03267 |
| cellx           | 53    | 0.020  | 0.01204 | 0.01971 | 0.07467 |
| reatom          | 40    | 0.026  | 0.01271 | 0.02627 | 0.17533 |
| wonka           | 33    | 0.032  | 0.02471 | 0.03150 | 0.08996 |
| mobx            | 32    | 0.033  | 0.02550 | 0.03254 | 0.08125 |
| effector        | 20    | 0.052  | 0.04179 | 0.05225 | 0.13208 |
| effector (fork) | 16    | 0.066  | 0.05129 | 0.06577 | 1.68988 |

#### Median on one call in ms from 100 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| s.js            | 100   | 0.006  | 0.00533 | 0.00594 | 0.01233 |
| preact          | 88    | 0.007  | 0.00604 | 0.00671 | 0.01108 |
| usignal         | 84    | 0.007  | 0.00292 | 0.00708 | 0.01196 |
| solid           | 54    | 0.011  | 0.00950 | 0.01100 | 0.01796 |
| mol             | 54    | 0.011  | 0.00846 | 0.01106 | 0.01937 |
| effector        | 50    | 0.012  | 0.00858 | 0.01185 | 0.05829 |
| cellx           | 48    | 0.012  | 0.01058 | 0.01244 | 0.02554 |
| whatsup         | 46    | 0.013  | 0.01121 | 0.01302 | 0.02050 |
| reatom          | 45    | 0.013  | 0.01088 | 0.01312 | 0.02392 |
| effector (fork) | 32    | 0.019  | 0.01592 | 0.01865 | 0.07229 |
| wonka           | 32    | 0.019  | 0.01412 | 0.01883 | 0.03342 |
| mobx            | 31    | 0.019  | 0.01592 | 0.01885 | 0.03654 |

#### Median on one call in ms from 1000 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| s.js            | 100   | 0.001  | 0.00112 | 0.00138 | 0.00604 |
| preact          | 87    | 0.002  | 0.00133 | 0.00158 | 0.00579 |
| usignal         | 82    | 0.002  | 0.00150 | 0.00167 | 0.00367 |
| mol             | 77    | 0.002  | 0.00150 | 0.00179 | 0.00788 |
| solid           | 69    | 0.002  | 0.00175 | 0.00200 | 0.00908 |
| whatsup         | 49    | 0.003  | 0.00250 | 0.00279 | 0.00750 |
| reatom          | 47    | 0.003  | 0.00233 | 0.00292 | 0.00871 |
| cellx           | 35    | 0.004  | 0.00325 | 0.00392 | 0.01112 |
| wonka           | 23    | 0.006  | 0.00533 | 0.00604 | 0.01125 |
| mobx            | 21    | 0.006  | 0.00542 | 0.00650 | 0.02004 |
| effector        | 20    | 0.007  | 0.00642 | 0.00692 | 0.01175 |
| effector (fork) | 12    | 0.012  | 0.01108 | 0.01171 | 0.01821 |

#### Median on one call in ms from 10000 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| s.js            | 100   | 0.001  | 0.00063 | 0.00071 | 0.00121 |
| preact          | 85    | 0.001  | 0.00071 | 0.00083 | 0.00154 |
| mol             | 63    | 0.001  | 0.00100 | 0.00112 | 0.00250 |
| solid           | 49    | 0.001  | 0.00137 | 0.00146 | 0.00196 |
| usignal         | 46    | 0.002  | 0.00146 | 0.00154 | 0.00233 |
| cellx           | 37    | 0.002  | 0.00167 | 0.00192 | 0.00462 |
| reatom          | 33    | 0.002  | 0.00192 | 0.00212 | 0.00288 |
| whatsup         | 33    | 0.002  | 0.00200 | 0.00212 | 0.00392 |
| mobx            | 17    | 0.004  | 0.00383 | 0.00413 | 0.00608 |
| wonka           | 14    | 0.005  | 0.00483 | 0.00517 | 0.00621 |
| effector        | 11    | 0.006  | 0.00613 | 0.00646 | 0.00854 |
| effector (fork) | 7     | 0.010  | 0.00992 | 0.01033 | 0.01292 |

### Gitpod (AMD EPYC 7B13)

#### Median of computers creation and linking from 5 iterations
(UNSTABLE)

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| usignal         | 100   | 0.030  | 0.01589 | 0.03039 | 0.50217 |
| solid           | 51    | 0.060  | 0.04055 | 0.05978 | 0.47971 |
| preact          | 47    | 0.064  | 0.01949 | 0.06418 | 0.56012 |
| s.js            | 42    | 0.072  | 0.02377 | 0.07222 | 0.50051 |
| cellx           | 41    | 0.075  | 0.07226 | 0.07487 | 1.01093 |
| reatom          | 26    | 0.119  | 0.07593 | 0.11873 | 1.18550 |
| whatsup         | 23    | 0.134  | 0.07454 | 0.13372 | 0.87868 |
| wonka           | 21    | 0.147  | 0.12250 | 0.14668 | 1.03147 |
| mol             | 17    | 0.182  | 0.05997 | 0.18172 | 0.93569 |
| mobx            | 14    | 0.219  | 0.18675 | 0.21909 | 2.93630 |
| effector (fork) | 8     | 0.399  | 0.32772 | 0.39919 | 1.22574 |
| effector        | 5     | 0.650  | 0.38244 | 0.65048 | 3.21894 |

#### Median on one call in ms from 10 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| s.js            | 100   | 0.017  | 0.01395 | 0.01713 | 0.06426 |
| preact          | 93    | 0.018  | 0.01473 | 0.01835 | 0.09031 |
| usignal         | 80    | 0.021  | 0.01968 | 0.02142 | 0.05948 |
| solid           | 63    | 0.027  | 0.02506 | 0.02719 | 0.04123 |
| mol             | 59    | 0.029  | 0.02565 | 0.02929 | 0.11831 |
| whatsup         | 51    | 0.034  | 0.03208 | 0.03382 | 0.10928 |
| cellx           | 36    | 0.047  | 0.03621 | 0.04716 | 0.12918 |
| reatom          | 30    | 0.058  | 0.04578 | 0.05806 | 0.16097 |
| mobx            | 29    | 0.059  | 0.05176 | 0.05947 | 0.14515 |
| wonka           | 18    | 0.093  | 0.08042 | 0.09304 | 0.14148 |
| effector        | 17    | 0.099  | 0.08863 | 0.09924 | 0.14191 |
| effector (fork) | 14    | 0.126  | 0.10867 | 0.12561 | 2.70701 |

#### Median on one call in ms from 100 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| s.js            | 100   | 0.013  | 0.01168 | 0.01256 | 0.01875 |
| preact          | 89    | 0.014  | 0.01297 | 0.01417 | 0.02270 |
| usignal         | 79    | 0.016  | 0.00731 | 0.01588 | 0.02368 |
| solid           | 55    | 0.023  | 0.02026 | 0.02295 | 0.03746 |
| mol             | 55    | 0.023  | 0.01844 | 0.02303 | 0.03712 |
| effector        | 50    | 0.025  | 0.02072 | 0.02499 | 0.09192 |
| cellx           | 43    | 0.029  | 0.02660 | 0.02917 | 0.04703 |
| whatsup         | 43    | 0.029  | 0.02629 | 0.02925 | 0.04118 |
| reatom          | 31    | 0.041  | 0.03597 | 0.04056 | 0.06212 |
| effector (fork) | 31    | 0.041  | 0.03369 | 0.04076 | 0.16500 |
| mobx            | 28    | 0.045  | 0.03931 | 0.04486 | 0.06464 |
| wonka           | 26    | 0.048  | 0.03700 | 0.04811 | 0.09612 |

#### Median on one call in ms from 1000 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| usignal         | 100   | 0.007  | 0.00562 | 0.00663 | 0.00925 |
| s.js            | 99    | 0.007  | 0.00585 | 0.00668 | 0.01230 |
| preact          | 95    | 0.007  | 0.00626 | 0.00697 | 0.01322 |
| mol             | 84    | 0.008  | 0.00595 | 0.00790 | 0.01948 |
| solid           | 75    | 0.009  | 0.00766 | 0.00886 | 0.02020 |
| whatsup         | 55    | 0.012  | 0.01036 | 0.01195 | 0.01898 |
| cellx           | 45    | 0.015  | 0.01239 | 0.01482 | 0.02751 |
| reatom          | 31    | 0.021  | 0.01871 | 0.02108 | 0.03489 |
| effector        | 31    | 0.021  | 0.01914 | 0.02148 | 0.03049 |
| mobx            | 27    | 0.025  | 0.02044 | 0.02467 | 0.04535 |
| wonka           | 21    | 0.032  | 0.02820 | 0.03157 | 0.04671 |
| effector (fork) | 20    | 0.033  | 0.02964 | 0.03284 | 0.04932 |

#### Median on one call in ms from 10000 iterations

| (index)         | pos % | avg ms | min ms  | med ms  | max ms  |
| --------------- | ----- | ------ | ------- | ------- | ------- |
| s.js            | 100   | 0.004  | 0.00308 | 0.00362 | 0.00601 |
| preact          | 90    | 0.004  | 0.00331 | 0.00404 | 0.00655 |
| mol             | 72    | 0.005  | 0.00397 | 0.00501 | 0.01046 |
| usignal         | 66    | 0.005  | 0.00474 | 0.00550 | 0.00782 |
| solid           | 59    | 0.006  | 0.00545 | 0.00614 | 0.00828 |
| whatsup         | 49    | 0.007  | 0.00649 | 0.00745 | 0.01119 |
| cellx           | 42    | 0.009  | 0.00671 | 0.00855 | 0.01392 |
| reatom          | 21    | 0.017  | 0.01478 | 0.01691 | 0.02689 |
| mobx            | 21    | 0.017  | 0.01438 | 0.01716 | 0.02585 |
| effector        | 21    | 0.018  | 0.01530 | 0.01765 | 0.02637 |
| effector (fork) | 15    | 0.024  | 0.02171 | 0.02414 | 0.03913 |
| wonka           | 14    | 0.025  | 0.02357 | 0.02528 | 0.04137 |
