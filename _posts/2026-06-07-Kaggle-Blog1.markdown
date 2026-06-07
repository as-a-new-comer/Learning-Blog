---
layout: post
title:  "Kaggle-Blog 1"
date:   2026-06-04 12:00:00 +0800
categories: Miscellaneous
tags: DS
mathjax: false
---

### 2026/6/7 补档之前的记录

##### 5.20.2026

今天交上了生涯的第一篇Kaggle。用的是Titanic的数据集。大概流程是这样的：

读入csv

分栏统计means

发现强特征sex和Pclass

考虑fare,Pclass&Cabin的关系，列交叉表

发现冗余信息

挑选Pclass,sex等强特征直接用LogisticRegression和RandomForest去学习，最后得到0.75和0.79的rank

下一步在这里的优化可以先尝试XGBoost，如果没有显著提升可以考虑特征预加工

玩好玩？？！！


