---
layout: post
title:  "Kaggle-Blog 2 Ames Housing"
date:   2026-06-07 19:00:00 +0800
categories: Kaggle
tags: ames-housing feature-engineering
mathjax: false
---

# Ames Housing Price Prediction — Evaluation

**数据集：** Ames Housing (Kaggle)

**评估指标：** 5-Fold Cross-Validation R²

**最终结果：** **0.8642**

* * *

## 1. 背景

使用 Ames Housing 数据集（81 列，1460 条训练样本）预测住宅售价。目标是构建一条完整的回归管线，从缺值处理到模型调参。

* * *

## 2. 探索性数据分析

### 2.1 价格分布

    SalePrice 范围：$34,900 – $755,000
    均值：        $180,921
    中位数：      $163,000

原始分布严重右偏（长尾在高端），低端集中于 $150k-$160k。经 `np.log1p` 变换后接近正态分布——线性模型的前提条件满足。

![2b729c27-7a5a-4a05-86df-b9d7cdf6e741](/Learning-Blog/assets/images/2b729c27-7a5a-4a05-86df-b9d7cdf6e741.png)

![f23991ca-4887-4f36-a4bb-0f749444cba9](/Learning-Blog/assets/images/f23991ca-4887-4f36-a4bb-0f749444cba9.png)

### 2.2 缺失值诊断

81 列中有 19 列存在缺失值。按非空率进行排序：

| 列            | 非空率    | 含义             |
| ------------ | ------ | -------------- |
| PoolQC       | 0.5%   | 泳池质量（大多数房子无泳池） |
| MiscFeature  | 3.7%   | 杂项特征           |
| Alley        | 6.2%   | 巷子类型           |
| Fence        | 19.2%  | 篱笆类型           |
| FireplaceQu  | 52.7%  | 壁炉质量           |
| Bsmt* (多项)   | ~97.5% | 地下室相关          |
| Garage* (多项) | ~94.5% | 车库相关           |
| LotFrontage  | 82.3%  | 临街宽度           |
| Electrical   | 99.9%  | 电路系统           |

* * *

## 3. 数据预处理

### 3.1 缺值填充策略

区分两类 NaN：

**"无设施"类（NaN = 该房子没有此设施）：**填表示"无"的自定义字符串，不作为缺失数据处理。

| 列                                                            | 填充值          |
| ------------------------------------------------------------ | ------------ |
| BsmtQual, BsmtCond, BsmtExposure, BsmtFinType1, BsmtFinType2 | `"No_Bsm"`   |
| GarageType, GarageFinish, GarageQual, GarageCond             | `"No_Gar"`   |
| FireplaceQu                                                  | `"No_Fir"`   |
| Alley                                                        | `"No_Alley"` |
| Fence                                                        | `"No_Fence"` |
| PoolQC                                                       | `"None"`     |
| MiscFeature                                                  | `"None"`     |
| MasVnrType                                                   | `"NoMas"`    |

**"丢失数据"类（NaN = 记录丢失）：**用统计量填充。

| 列                                              | 填充策略         |
| ---------------------------------------------- | ------------ |
| LotFrontage                                    | 均值           |
| Electrical                                     | 众数 `"SBrkr"` |
| MasVnrArea, GarageYrBlt                        | 0            |
| BsmtFinSF1, BsmtFinSF2, BsmtUnfSF, TotalBsmtSF | 0            |
| BsmtFullBath, BsmtHalfBath                     | 0            |
| GarageCars, GarageArea                         | 0            |

### 3.2 特征删除

通过分组聚合验证（按类分组看统计指标），以下列与目标售价无显著关联，直接删除：

* **Alley**（有无巷子不影响价格）

* **Fence**（篱笆类型影响极小）

* **PoolQC**（仅有 7 条数据有泳池，不具备统计意义）

* **MiscFeature**（杂项类别与价格无稳定关系）
  
  ##### PS：纯手动做的蠢蛋来了

* * *

## 4. 特征编码

### 4.1 序编码（有序质量列）

10 个质量/程度类特征具有天然顺序关系（`Ex > Gd > TA > Fa > Po`），用显式字典映射保留顺序信息：
    quality_order = {"Ex": 5, "Gd": 4, "TA": 3, "Fa": 2, "Po": 1, "No": 0}

处理的列：`ExterQual`, `KitchenQual`, `BsmtQual`, `GarageQual`, `FireplaceQu`, `HeatingQC`,`BsmtExposure`, `BsmtFinType1`, `GarageFinish`

未使用 LabelEncoder（会破坏顺序信息）。

### 4.2 One-Hot 编码（无序类别列）

剩余 object 列（含 `MSZoning`, `Neighborhood`, `SaleCondition` 等约 20 列）全部 `pd.get_dummies(drop_first=True)`。

序编码在前，One-Hot 在后——序编码列已转为 int，`select_dtypes("object")` 不会重复选择它们。

* * *

## 5. 模型与调参

### 5.1 基线问题

初始 ElasticNet(α=1.0) + LabelEncoder + 无标准化 → R² = 0.7676（方差大，部分 fold 低于 0.65）。

### 5.2 诊断

R² 中间行表示模型在某些 fold 表现不稳定。根源有三：

1. LabelEncoder 破坏列的顺序信息
2. 未做 log1p 变换
3. 未做标准化后 ElasticNet α 与真实正则强度不匹配。直接把小尺度压没了（还给我啊

### 5.3 管线

    Raw → fillna → qual_map → get_dummies → log1p(y & 偏态特征) 
    → StandardScaler → ElasticNet(α, l1_ratio) → 5-Fold CV R²

### 5.4 网格搜索

两阶段搜索：

**阶段一：α 搜索（线性步长，500 步）**

搜索范围：

* α: 0.001 ~ 0.5，步长 0.001
* l1_ratio 固定为 0.5

**阶段二：l1_ratio 搜索（51 步）**

搜索范围：

* l1_ratio: 0.2 ~ 0.7，步长 0.01
* α 固定在阶段一的最佳值

### 5.5 最佳参数

| 参数       | 最佳值                              | 搜索范围                  |
| -------- | -------------------------------- | --------------------- |
| α        | 0.009                            | 0.001 – 0.5（线性 500 步） |
| l1_ratio | 0.47 | 0.2 – 0.7（线性 51 步）    |
| 标准化      | StandardScaler                   | —                     |

##### PS：仅限本DataSet :P 大规模数据还是下降/二分更适合罢

* * *

## 6. 结果

### 6.1 最终指标

    5-Fold CV R²: 0.8642（无缩放基线: 0.7676）

StandardScaler + 大幅降低 α（从 1.0 降至 0.009）使 R² 提升约 10 个百分点。

### 6.2 关键发现

1. **StandardScaler 在 ElasticNet 前是必要的**——量级差 1000 倍的列会使 L1 正则错误地惩罚小量级特征。
2. **α 需要重新缩放**——标准化后 α=1.0 等价于原始量级的 ~0.01，搜索从 0.001 起步找最优。
3. **质量列序编码收益有限**——与 LabelEncoder 比，ElasticNet 对序编码不敏感，差值约 1-2 个百分点。但显式映射确保了可解释性。
4. **缺值区分策略有效**——"无设施"填字符串 vs "丢失"填统计量，保留了原始数据语义且不影响模型。

* * *

## 7. 局限与后续方向

### 未探索的方向

| 方向                 | 预期收益  | 不做的原因                                                |
| ------------------ | ----- | ---------------------------------------------------- |
| XGBoost / LightGBM | +3-5% | 本管线专注于线性模型的预处理与调参，未切换到树模型                            |
| 异常值修剪              | +1%   | Ames 有 3-5 个极端高价位异常点，理论上修剪后弹性网系数更稳定                  |
| 手工特征组合             | +1-2% | TotalSF = GrLivArea + TotalBsmtSF 等 EDA 中发现的强信号结构未编码 |
| PCA 降维             | ~0%   | ElasticNet L1 已做特征选择，PCA 收益很小且破坏可解释性                 |
| Stacking（EN + XGB） | +2-3% | 两个模型预测取加权平均，预期可达到 0.89-0.91                          |

### 下一步最优先

1. **读系数列表**——`pd.Series(model.coef_, index=X.columns).sort_values()` 看 ElasticNet 保留了哪些特征
2. **切 XGBoost**——不做任何特征工程，用相同 X 直接训练 `XGBRegressor`，与 EN 做对比
3. **硬投票平均**——EN 预测值 × 0.5 + XGB 预测值 × 0.5，验证是否超过单一模型

* * *

## 8.人类自己的话

技术上上面总结的差不多。很多中间的标准流程已经归档啦哈哈。这毕竟是第二个数据集。我打算先研究一下现在的Mk2，然后再考虑multi-model、卷R²的事情。应该说DS其实也是很有趣的一件事。那就继续做下去吧😎

到现在的两代：

## Mk1: 对数化处理长尾+FillNaN+One-Hot编码+ElasticNet

### R²=0.7676 ± 0.0971 。 基础pipeline是完成的。打算进一步优化。

* * *

### Mk2: 有序Data采用序编码，并且进行规格拉近，防止Elastic正则化直接舍弃小尺寸数据

##### Q:alpha太大，正则化把数据直接压死了

##### S :做500次循环alpha拟合找最好的alpha值，发现是0.009；顺便也把Ratio暴力破一下，0.47（大规模数据就直接梯度下降或者二分，咱就别暴力了）

最后表现：

##### R²=0.8605 ± 0.0565

实际上，一开始提出的热力图/交叉验证/非线性建模，被证明是：

# 在ElasticNet的正则化神力下，老手工艺人还是算了

乱七八糟就乱七八糟吧。AI时代人类最珍贵的品质当然包括出格了（bushi
