---
layout: post
title:  "Kaggle-Blog 3 Ames Housing"
date:   2026-06-10 23:00:00 +0800
categories: Kaggle
tags: ames-housing feature-engineering
mathjax: false
---

# Ames Housing Price Prediction — Evaluation

**数据集：** Ames Housing (Kaggle)

**评估指标：** 5-Fold Cross-Validation R²

## **最终结果**：**$Mk4:R^2 = 0.9010±0.0086$**

---

## Mk1: 对数化处理长尾+FillNaN+One-Hot编码+ElasticNet

### $R²=0.7676 ± 0.0971$ 。 基础pipeline是完成的。打算进一步优化。

* * *

## Mk2： 有序Data采用序编码，并且进行规格拉近，防止Elastic正则化直接舍弃小尺寸数据

### Q:alpha太大，正则化把数据直接压死了

### S :做500次循环alpha拟合找最好的alpha值，发现是0.009；顺便也把Ratio暴力破一下，0.47（大规模数据就直接梯度下降或者二分，咱就别暴力了）

最后表现：

### $R²=0.8605 ± 0.0565$

实际上，一开始提出的热力图/交叉验证/非线性建模，被证明是：

# 在ElasticNet的正则化神力下，老手工艺人还是算了

乱七八糟就乱七八糟吧。AI时代人类最珍贵的品质当然包括出格了（bushi

---

## Mk3：对LotArea/GrLivArea/1stFlrSF等Tag也进行对数log1p变换，因为这几个特征严重右偏，而线性模型对极端值敏感。拉回近似正态之后，表现进一步提升了2个百分点。

---

## Mk4：更换模型。我们全新的XGBoost已经完全超越了老式的ElasticNet。把精度限制在个位，把平均误差压到8.7%，最终的结果：

### $R^2=0.9010±0.0086$

### 均值和稳定性都显著提升了。不进行对最优树结构的grid_search

### 而且对比试验显示，是否对数拉平、是否序编码，根本不重要。树模型自己就能够学习这些，并且达到和手动处理之后几乎相同的结果。
