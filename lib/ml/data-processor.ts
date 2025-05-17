import { Parser } from 'papaparse';
import * as math from 'mathjs';
import { SimpleLinearRegression, PolynomialRegression } from 'ml-regression';
import { DateTime } from 'luxon';
import _ from 'lodash';
import * as tf from '@tensorflow/tfjs';

export interface BusinessData {
  Date: string;
  Store: string;
  Product: string;
  Category: string;
  Units_Sold: number;
  Price_per_Unit_BWP: number;
  Revenue_BWP: number;
  Competition_Price_BWP: number;
  Promotion_Active: number;
  Customer_Retention_Score: number;
  Stock_Level: number;
  Supplier: string;
  Lead_Time_Days: number;
  Customer_Demographic: string;
  Payment_Method: string;
}

export class AdvancedAnalytics {
  static async processData(data: BusinessData[]) {
    // Sort data by date first
    const sortedData = data.sort((a, b) => 
      DateTime.fromFormat(a.Date, 'dd/MM/yyyy').toMillis() - 
      DateTime.fromFormat(b.Date, 'dd/MM/yyyy').toMillis()
    )

    // Group data by date for sales analysis
    const salesByDate = sortedData.reduce((acc, item) => {
      const date = item.Date
      if (!acc[date]) {
        acc[date] = {
          totalSales: 0,
          transactions: 0,
          revenue: 0
        }
      }
      acc[date].totalSales += item.Units_Sold
      acc[date].transactions += 1
      acc[date].revenue += item.Revenue_BWP
      return acc
    }, {} as Record<string, { totalSales: number; transactions: number; revenue: number }>)

    // Calculate moving averages and predictions
    const dates = Object.keys(salesByDate).sort()
    const salesValues = dates.map(date => salesByDate[date].totalSales)
    
    // Calculate 7-day moving average
    const movingAverage = this.calculateMovingAverage(salesValues, 7)
    
    // Simple exponential smoothing for predictions
    const alpha = 0.2 // smoothing factor
    const predictions = this.exponentialSmoothing(salesValues, alpha, 30)

    // Group data by product for performance analysis
    const salesByProduct = sortedData.reduce((acc, item) => {
      if (!acc[item.Product]) {
        acc[item.Product] = {
          revenue: 0,
          unitsSold: 0,
          transactions: 0
        }
      }
      acc[item.Product].revenue += item.Revenue_BWP
      acc[item.Product].unitsSold += item.Units_Sold
      acc[item.Product].transactions += 1
      return acc
    }, {} as Record<string, { revenue: number; unitsSold: number; transactions: number }>)

    // Calculate overall metrics
    const totalRevenue = Object.values(salesByProduct)
      .reduce((sum, prod) => sum + prod.revenue, 0)
    const totalUnits = Object.values(salesByProduct)
      .reduce((sum, prod) => sum + prod.unitsSold, 0)
    const avgTicketSize = totalRevenue / Object.values(salesByDate)
      .reduce((sum, day) => sum + day.transactions, 0)

    return {
      salesAnalysis: {
        overall_metrics: {
          total_revenue: totalRevenue,
          total_units: totalUnits,
          average_ticket_size: avgTicketSize
        },
        top_products: Object.entries(salesByProduct)
          .map(([product, stats]) => ({
            product,
            revenue: stats.revenue,
            units: stats.unitsSold,
            average_price: stats.revenue / stats.unitsSold
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
        daily_sales: dates.map(date => ({
          date,
          units_sold: salesByDate[date].totalSales,
          transactions: salesByDate[date].transactions
        }))
      },
      predictions: {
        historical: dates.map((date, i) => ({
          date,
          actual: salesValues[i],
          moving_average: movingAverage[i]
        })),
        forecast: predictions.map((value, i) => ({
          date: this.addDays(dates[dates.length - 1], i + 1),
          predicted: value
        }))
      },
      customerSegments: this.analyzeCustomerSegments(sortedData),
      inventoryInsights: this.analyzeInventory(sortedData)
    }
  }

  private static calculateMovingAverage(data: number[], window: number): (number | null)[] {
    return data.map((_, index) => {
      if (index < window - 1) return null
      const slice = data.slice(index - window + 1, index + 1)
      return slice.reduce((sum, val) => sum + val, 0) / window
    })
  }

  private static exponentialSmoothing(data: number[], alpha: number, horizon: number): number[] {
    let lastValue = data[data.length - 1]
    const predictions = []

    for (let i = 0; i < horizon; i++) {
      lastValue = alpha * data[data.length - 1] + (1 - alpha) * lastValue
      predictions.push(Math.max(0, Math.round(lastValue)))
    }

    return predictions
  }

  private static addDays(dateStr: string, days: number): string {
    return DateTime.fromFormat(dateStr, 'dd/MM/yyyy')
      .plus({ days })
      .toFormat('dd/MM/yyyy')
  }

  private static analyzeCustomerSegments(data: BusinessData[]) {
    // Group by customer demographic
    const customerGroups = this.groupByDemographic(data)
    
    // Calculate RFM scores for each demographic
    const segments = Object.entries(customerGroups).map(([demographic, purchases]) => {
      const stats = {
        lastPurchaseDate: purchases[purchases.length - 1].Date,
        totalTransactions: purchases.length,
        totalRevenue: purchases.reduce((sum, p) => sum + p.Revenue_BWP, 0)
      };
      // Recency: Days since last purchase
      const lastPurchaseDate = DateTime.fromFormat(purchases[purchases.length - 1].Date, 'dd/MM/yyyy')
      const today = DateTime.now()
      const recency = Math.floor(today.diff(lastPurchaseDate, 'days').days)

      // Frequency: Number of transactions
      const frequency = purchases.length

      // Monetary: Total revenue
      const monetary = purchases.reduce((sum, p) => sum + p.Revenue_BWP, 0)

      // Calculate scores (1-5 scale)
      const rScore = this.calculateRFMScore(recency, 'desc') // Lower recency is better
      const fScore = this.calculateRFMScore(frequency, 'asc') // Higher frequency is better
      const mScore = this.calculateRFMScore(monetary, 'asc') // Higher monetary is better

      // Calculate total RFM score
      const totalScore = (rScore + fScore + mScore) / 3

      // Determine segment based on score
      const segment = totalScore >= 4 ? 'High-Value' :
                     totalScore >= 3 ? 'Mid-Value' : 'Low-Value'

      return {
        demographic,
        segment,
        metrics: {
          recency: `${recency} days`,
          frequency,
          monetary
        },
        score: totalScore
      }
    })

    return segments.sort((a, b) => b.score - a.score)
  }

  // Add this helper method for RFM scoring
  private static calculateRFMScore(value: number, direction: 'asc' | 'desc'): number {
    // Create quintiles for scoring
    const quintileSize = 20 // percentage
    const score = direction === 'asc' 
      ? Math.ceil((value / this.getMaxValue()) * 100 / quintileSize)
      : Math.ceil((1 - value / this.getMaxValue()) * 100 / quintileSize)
    
    // Ensure score is between 1-5
    return Math.max(1, Math.min(5, score))
  }

  // Helper to get max values for normalization
  private static getMaxValue(): number {
    // You might want to adjust these based on your data
    return 1000 // example maximum value
  }

  private static analyzeInventory(data: BusinessData[]) {
    // Group by product for detailed analysis
    const productGroups = data.reduce((acc, item) => {
      if (!acc[item.Product]) {
        acc[item.Product] = []
      }
      acc[item.Product].push(item)
      return acc
    }, {} as Record<string, BusinessData[]>)

    // Calculate metrics for each product
    const inventoryMetrics = Object.entries(productGroups).map(([product, items]) => {
      // Calculate key metrics
      const revenue = items.reduce((sum, item) => sum + item.Revenue_BWP, 0)
      const currentStock = items[items.length - 1].Stock_Level
      const avgDailySales = items.reduce((sum, item) => sum + item.Units_Sold, 0) / items.length
      const avgLeadTime = items.reduce((sum, item) => sum + item.Lead_Time_Days, 0) / items.length
      
      // Calculate safety stock and reorder point
      const standardDeviation = Math.sqrt(
        items.reduce((sum, item) => 
          sum + Math.pow(item.Units_Sold - avgDailySales, 2), 0
        ) / items.length
      )
      
      const safetyStock = Math.ceil(1.96 * standardDeviation * Math.sqrt(avgLeadTime))
      const reorderPoint = Math.ceil(avgDailySales * avgLeadTime + safetyStock)

      return {
        product,
        revenue,
        metrics: {
          stock_level: currentStock,
          reorder_point: reorderPoint,
          avg_daily_sales: avgDailySales,
          lead_time: avgLeadTime,
          safety_stock: safetyStock,
          stock_coverage: currentStock / avgDailySales // Days of inventory
        }
      }
    })

    // Calculate total revenue for percentage calculations
    const totalRevenue = inventoryMetrics.reduce((sum, item) => sum + item.revenue, 0)

    // Add percentages and sort for ABC classification
    const enrichedMetrics = inventoryMetrics
      .map(item => ({
        ...item,
        percentage: (item.revenue / totalRevenue) * 100
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Apply ABC classification
    let cumulativePercent = 0
    return enrichedMetrics.map(item => {
      cumulativePercent += item.percentage
      return {
        ...item,
        category: cumulativePercent <= 70 ? 'A' :
                 cumulativePercent <= 90 ? 'B' : 'C'
      }
    })
  }

  private static parseDate(dateStr: string): Date {
    // Assuming date format is dd/MM/yyyy
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private static async predictSales(data: (BusinessData & { DateObj: Date })[]) {
    // Sort data by date
    const sortedData = data.sort((a, b) => a.DateObj.getTime() - b.DateObj.getTime());
    
    // Prepare features for time series
    const timePoints = sortedData.map((_, index) => index);
    const sales = sortedData.map(row => row.Units_Sold);

    // Fit polynomial regression for trend
    const degree = 2;
    const regression = new PolynomialRegression(timePoints, sales, degree);

    // Make predictions for next 30 days
    const predictions = [];
    const lastDate = sortedData[sortedData.length - 1].DateObj;

    for (let i = 0; i < 30; i++) {
      const predictionPoint = timePoints.length + i;
      const predictedSales = Math.max(0, Math.round(regression.predict(predictionPoint)));
      
      const predictionDate = new Date(lastDate);
      predictionDate.setDate(predictionDate.getDate() + i + 1);
      
      predictions.push({
        date: DateTime.fromJSDate(predictionDate).toFormat('dd/MM/yyyy'),
        predicted_sales: predictedSales
      });
    }

    // Calculate model metrics
    const modelMetrics = this.calculateModelMetrics(sales, timePoints.map(t => regression.predict(t)));

    // Calculate feature importance using correlation analysis
    const featureImportance = this.calculateFeatureImportance(sortedData);

    return {
      predictions,
      model_metrics: {
        ...modelMetrics,
        feature_importance: featureImportance
      }
    };
  }

  private static calculateModelMetrics(actual: number[], predicted: number[]) {
    const mse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / actual.length;
    const rmse = Math.sqrt(mse);
    const r2 = this.calculateR2(actual, predicted);
    const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / actual.length;

    return { mse, rmse, r2, mae };
  }

  private static calculateFeatureImportance(data: (BusinessData & { DateObj: Date })[]) {
    const features = [
      'Price_per_Unit_BWP',
      'Promotion_Active',
      'Customer_Retention_Score',
      'Stock_Level',
      'Competition_Price_BWP'
    ];

    return features.map(feature => {
      const correlation = this.calculateCorrelation(
        data.map(row => row[feature as keyof BusinessData] as number),
        data.map(row => row.Units_Sold)
      );

      return {
        feature,
        importance: Math.abs(correlation)
      };
    }).sort((a, b) => b.importance - a.importance);
  }

  private static calculateCorrelation(x: number[], y: number[]) {
    const meanX = math.mean(x);
    const meanY = math.mean(y);
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denominator = Math.sqrt(
      x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0) *
      y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
    );
    return numerator / denominator;
  }

  private static async performCustomerSegmentation(data: (BusinessData & { DateObj: Date })[]) {
    // Group by customer demographic
    const customerGroups = _.groupBy(data, 'Customer_Demographic');
    
    // Calculate RFM metrics for each customer segment
    const customerMetrics = Object.entries(customerGroups).map(([demographic, purchases]) => {
      const totalRevenue = _.sumBy(purchases, 'Revenue_BWP');
      const avgRevenue = totalRevenue / purchases.length;
      const totalUnits = _.sumBy(purchases, 'Units_Sold');
      const avgRetention = _.meanBy(purchases, 'Customer_Retention_Score');
      
      return {
        demographic,
        metrics: {
          monetary: avgRevenue,
          frequency: purchases.length,
          recency: this.calculateRecency(purchases),
          avgUnits: totalUnits / purchases.length,
          retentionScore: avgRetention
        }
      };
    });

    // Create feature vectors for clustering
    const featureVectors = customerMetrics.map(cm => [
      cm.metrics.monetary,
      cm.metrics.frequency,
      cm.metrics.recency,
      cm.metrics.avgUnits,
      cm.metrics.retentionScore
    ]);

    // Normalize data for clustering
    const featureTensor = tf.tensor2d(featureVectors);
    const { mean, variance } = tf.moments(featureTensor, 0);
    const stddev = tf.sqrt(variance);
    const normalizedFeatures = featureTensor.sub(mean).div(stddev);
    
    // Perform k-means clustering (k=3)
    const clusters = await this.kMeansClustering(normalizedFeatures.arraySync() as number[][], 3);
    
    // Generate segment insights
    const segmentedCustomers = customerMetrics.map((customer, i) => ({
      demographic: customer.demographic,
      metrics: customer.metrics,
      segment: clusters.assignments[i]
    }));

    const segments = _.groupBy(segmentedCustomers, 'segment');
    const segmentInsights = Object.entries(segments).map(([segment, customers]) => {
      const avgMonetary = _.meanBy(customers, c => c.metrics.monetary);
      const avgFrequency = _.meanBy(customers, c => c.metrics.frequency);
      const avgRetention = _.meanBy(customers, c => c.metrics.retentionScore);
      
      let segmentName = '';
      if (avgMonetary > 80 && avgRetention > 7) {
        segmentName = 'High-Value Loyal';
      } else if (avgMonetary > 60 || avgFrequency > 10) {
        segmentName = 'Regular Customers';
      } else {
        segmentName = 'Occasional Shoppers';
      }
      
      return {
        segment: Number(segment),
        name: segmentName,
        size: customers.length,
        avg_monetary: avgMonetary,
        avg_frequency: avgFrequency,
        avg_retention: avgRetention,
        customers: customers.map(c => c.demographic)
      };
    });

    return {
      segments: segmentInsights,
      recommendations: this.generateCustomerRecommendations(segmentInsights)
    };
  }

  private static async optimizeInventory(data: (BusinessData & { DateObj: Date })[]) {
    // Group by product
    const productGroups = _.groupBy(data, 'Product');
    
    // Calculate inventory metrics
    const productMetrics = Object.entries(productGroups).map(([product, items]) => {
      const salesArray = items.map(item => item.Units_Sold);
      const avgSales = _.mean(salesArray);
      const stdSales = math.std(salesArray) as unknown as number;
      const avgLeadTime = _.meanBy(items, 'Lead_Time_Days');
      const avgStock = _.meanBy(items, 'Stock_Level');
      
      // Calculate safety stock (service level of 95% - 1.65 sigma)
      const safetyStock = Math.ceil(1.65 * stdSales * Math.sqrt(avgLeadTime));
      
      // Calculate reorder point
      const reorderPoint = Math.ceil(avgSales * avgLeadTime + safetyStock);
      
      // Calculate economic order quantity (EOQ)
      const annualDemand = avgSales * 365;
      const holdingCost = 10; // Placeholder for holding cost
      const orderingCost = 100; // Placeholder for ordering cost
      const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
      
      return {
        product,
        metrics: {
          avg_daily_sales: avgSales,
          std_sales: stdSales,
          lead_time: avgLeadTime,
          avg_stock: avgStock,
          safety_stock: safetyStock,
          reorder_point: reorderPoint,
          economic_order_quantity: eoq
        }
      };
    });

    return {
      inventory_metrics: productMetrics,
      optimization_recommendations: this.generateInventoryRecommendations(productMetrics)
    };
  }

  private static async analyzeMarketBasket(data: (BusinessData & { DateObj: Date })[]) {
    // Group transactions by date and store (assuming these constitute a single transaction)
    const transactionGroups = _.groupBy(data, item => 
      `${item.Date}-${item.Store}-${item.Customer_Demographic}`);
    
    // Create transaction itemsets
    const transactions = Object.values(transactionGroups).map(items => 
      items.map(item => item.Product));
    
    // Find frequent itemsets and generate association rules
    const minSupport = 0.05;
    const minConfidence = 0.3;
    
    const itemCounts = this.countItems(transactions);
    const frequentItems = this.findFrequentItems(itemCounts, transactions.length, minSupport);
    const frequentItemsets = this.generateFrequentItemsets(transactions, frequentItems, minSupport);
    const associationRules = this.generateAssociationRules(frequentItemsets, transactions, minConfidence);

    return {
      frequent_itemsets: frequentItemsets.map(({itemset, support}) => ({
        items: itemset,
        support: support
      })),
      association_rules: associationRules.map(rule => ({
        antecedent: rule.antecedent,
        consequent: rule.consequent,
        confidence: rule.confidence,
        lift: rule.lift
      }))
    };
  }

  private static async detectAnomalies(data: (BusinessData & { DateObj: Date })[]) {
    // Prepare data for anomaly detection
    const salesData = data.map(item => ({
      date: item.Date,
      product: item.Product,
      units_sold: item.Units_Sold,
      revenue: item.Revenue_BWP,
      price: item.Price_per_Unit_BWP
    }));

    // Detect sales anomalies using z-score
    const salesAnomalies = this.detectSalesAnomalies(salesData);
    
    // Detect price anomalies
    const priceAnomalies = this.detectPriceAnomalies(salesData);

    return {
      sales_anomalies: salesAnomalies,
      price_anomalies: priceAnomalies
    };
  }

  private static analyzeCompetition(data: (BusinessData & { DateObj: Date })[]) {
    // Group by product
    const productGroups = _.groupBy(data, 'Product');
    
    // Calculate price comparisons
    const priceComparisons = Object.entries(productGroups).map(([product, items]) => {
      const avgPrice = _.meanBy(items, 'Price_per_Unit_BWP');
      const avgCompetitionPrice = _.meanBy(items, 'Competition_Price_BWP');
      const priceDifference = avgPrice - avgCompetitionPrice;
      const priceRatio = avgPrice / avgCompetitionPrice;
      
      return {
        product,
        avg_price: avgPrice,
        avg_competition_price: avgCompetitionPrice,
        price_difference: priceDifference,
        price_ratio: priceRatio,
        is_price_competitive: priceRatio <= 1.05 // Within 5% of competition
      };
    });

    // Calculate market share (based on revenue)
    const totalRevenue = _.sumBy(data, 'Revenue_BWP');
    const revenueByStore = _.chain(data)
      .groupBy('Store')
      .mapValues(items => _.sumBy(items, 'Revenue_BWP'))
      .value();
      
    const marketShare = Object.entries(revenueByStore).map(([store, revenue]) => ({
      store,
      revenue,
      market_share: (revenue as number) / totalRevenue
    }));

    return {
      price_comparison: priceComparisons,
      market_share: marketShare,
      competitive_insights: this.generateCompetitiveInsights(priceComparisons, marketShare, data)
    };
  }

  // Helper methods
  private static calculateMSE(actual: number[], predicted: number[]): number {
    return actual.reduce((sum, val, i) => 
      sum + Math.pow(val - predicted[i], 2), 0) / actual.length;
  }

  private static calculateR2(actual: number[], predicted: number[]): number {
    const meanActual = _.mean(actual);
    const ssTotal = actual.reduce((a, b) => a + Math.pow(b - meanActual, 2), 0);
    const ssResidual = actual.reduce((a, b, i) => a + Math.pow(b - predicted[i], 2), 0);
    return 1 - (ssResidual / ssTotal);
  }

  private static calculateMAE(actual: number[], predicted: number[]): number {
    return actual.reduce((sum, val, i) => 
      sum + Math.abs(val - predicted[i]), 0) / actual.length;
  }

  private static async kMeansClustering(data: number[][], k: number) {
    // Convert to tensor
    const points = tf.tensor2d(data);
    
    // Randomly initialize centroids
    let centroids = points.gather(tf.randomUniform([k], 0, data.length, 'int32'));
    
    const assignments: number[] = Array(data.length).fill(0);
    let oldAssignments: number[] = [];
    let iterations = 0;
    const maxIterations = 100;
    
    while (!_.isEqual(assignments, oldAssignments) && iterations < maxIterations) {
      oldAssignments = [...assignments];
      iterations++;
      
      // Calculate distances
      const expandedPoints = points.expandDims(1);
      const expandedCentroids = centroids.expandDims(0);
      
      const distances = expandedPoints.sub(expandedCentroids).pow(2).sum(2);
      
      // Assign points to nearest centroid
      const newAssignments = distances.argMin(1).dataSync();
      for (let i = 0; i < newAssignments.length; i++) {
        assignments[i] = newAssignments[i];
      }
      
      // Update centroids
      const newCentroids = [];
      for (let i = 0; i < k; i++) {
        const clusterPoints = points.gather(
          tf.tensor1d(
            assignments.map((a, idx) => a === i ? idx : -1).filter(idx => idx !== -1),
            'int32'
          )
        );
        
        if (clusterPoints.shape[0] > 0) {
          newCentroids.push(clusterPoints.mean(0));
        } else {
          // If no points in cluster, keep old centroid
          newCentroids.push(centroids.slice([i], [1]));
        }
      }
      
      centroids = tf.concat(newCentroids);
    }
    
    return {
      assignments,
      centroids: centroids.arraySync() as number[][]
    };
  }

  private static estimateFeatureImportance(
    model: tf.Sequential,
    features: tf.Tensor,
    targets: tf.Tensor,
    featureNames: string[]
  ) {
    // Baseline prediction
    const baseline = model.evaluate(features, targets) as tf.Scalar;
    const baselineMSE = baseline.dataSync()[0];
    
    const importance = [];
    const numFeatures = featureNames.length;
    
    for (let i = 0; i < numFeatures; i++) {
      // Create copy of features
      const permFeatures = features.clone();
      const featureCol = permFeatures.slice([0, i], [-1, 1]);
      
      // Shuffle this column
      const shuffled = tf.tensor1d(
        _.shuffle(Array.from(featureCol.reshape([-1]).dataSync()))
      ).reshape(featureCol.shape);
      
      // Insert shuffled column
      const left = i > 0 ? permFeatures.slice([0, 0], [-1, i]) : null;
      const right = i < numFeatures - 1 ? 
        permFeatures.slice([0, i + 1], [-1, numFeatures - i - 1]) : null;
      
      let newFeatures;
      if (!left && right) {
        newFeatures = tf.concat([shuffled, right], 1);
      } else if (left && !right) {
        newFeatures = tf.concat([left, shuffled], 1);
      } else if (left && right) {
        newFeatures = tf.concat([left, shuffled, right], 1);
      } else {
        newFeatures = shuffled;
      }
      
      // Measure impact
      const permResult = model.evaluate(newFeatures, targets) as tf.Scalar;
      const permMSE = permResult.dataSync()[0];
      
      importance.push({
        feature: featureNames[i],
        importance: permMSE - baselineMSE
      });
    }
    
    return importance.sort((a, b) => b.importance - a.importance);
  }

  private static calculateRecency(purchases: (BusinessData & { DateObj: Date })[]) {
    const today = new Date();
    const mostRecent = _.maxBy(purchases, 'DateObj')?.DateObj || today;
    const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysDiff);
  }

  private static generateCustomerRecommendations(segments: any[]) {
    return segments.map(segment => {
      let recommendations = [];
      
      if (segment.name === 'High-Value Loyal') {
        recommendations = [
          'Create exclusive loyalty program for VIP customers',
          'Offer early access to new products',
          'Implement personalized service approach',
          'Consider developing premium product lines'
        ];
      } else if (segment.name === 'Regular Customers') {
        recommendations = [
          'Implement targeted promotional campaigns',
          'Create bundle offers to increase basket size',
          'Develop mid-tier loyalty incentives',
          'Focus on cross-selling complementary products'
        ];
      } else {
        recommendations = [
          'Focus on retention through limited-time offers',
          'Implement win-back campaigns for inactive customers',
          'Create awareness about product value',
          'Test price-sensitive promotions'
        ];
      }
      
      return {
        segment: segment.name,
        recommendations
      };
    });
  }

  private static generateInventoryRecommendations(productMetrics: any[]) {
    return productMetrics.map(product => {
      const recommendations = [];
      const metrics = product.metrics;
      
      if (metrics.avg_stock < metrics.reorder_point) {
        recommendations.push(`Increase stock levels to meet reorder point of ${metrics.reorder_point} units`);
      }
      
      if (metrics.avg_stock > metrics.reorder_point + metrics.economic_order_quantity) {
        recommendations.push('Current stock levels too high, consider reducing order quantities');
      }
      
      recommendations.push(`Set optimal order quantity to ${metrics.economic_order_quantity} units`);
      
      if (metrics.lead_time > 7) {
        recommendations.push('Consider finding suppliers with shorter lead times');
      }
      
      return {
        product: product.product,
        recommendations
      };
    });
  }

  private static countItems(transactions: string[][]) {
    const counts: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      transaction.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
      });
    });
    
    return counts;
  }

  private static findFrequentItems(
    itemCounts: Record<string, number>,
    totalTransactions: number,
    minSupport: number
  ) {
    return Object.entries(itemCounts)
      .filter(([_, count]) => count / totalTransactions >= minSupport)
      .map(([item]) => item);
  }

  private static generateFrequentItemsets(
    transactions: string[][],
    frequentItems: string[],
    minSupport: number
  ) {
    const result = [];
    const totalTransactions = transactions.length;
    
    // Add single-item sets
    const singleItemsets = frequentItems.map(item => ({
      itemset: [item],
      support: this.calculateSupport([item], transactions)
    }));
    result.push(...singleItemsets);
    
    // Generate pairs
    for (let i = 0; i < frequentItems.length; i++) {
      for (let j = i + 1; j < frequentItems.length; j++) {
        const pair = [frequentItems[i], frequentItems[j]];
        const support = this.calculateSupport(pair, transactions);
        
        if (support >= minSupport) {
          result.push({
            itemset: pair,
            support
          });
        }
      }
    }
    
    return result;
  }

  private static calculateSupport(itemset: string[], transactions: string[][]) {
    let count = 0;
    
    transactions.forEach(transaction => {
      if (itemset.every(item => transaction.includes(item))) {
        count++;
      }
    });
    
    return count / transactions.length;
  }

  private static generateAssociationRules(
    frequentItemsets: { itemset: string[]; support: number }[],
    transactions: string[][],
    minConfidence: number
  ) {
    const rules: { antecedent: string[]; consequent: string[]; confidence: number; lift: number }[] = [];
    
    // Find pairs and generate rules
    const pairItemsets = frequentItemsets.filter(({itemset}) => itemset.length > 1);
    
    pairItemsets.forEach(({itemset, support}) => {
      // Generate rules for each item in the itemset
      for (let i = 0; i < itemset.length; i++) {
        const antecedent = [itemset[i]];
        const consequent = itemset.filter((_, idx) => idx !== i);
        
        // Calculate confidence
        const antecedentSupport = this.calculateSupport(antecedent, transactions);
        const confidence = support / antecedentSupport;
        
        if (confidence >= minConfidence) {
          // Calculate lift
          const consequentSupport = this.calculateSupport(consequent, transactions);
          const lift = confidence / consequentSupport;
          
          rules.push({
            antecedent,
            consequent,
            confidence,
            lift
          });
        }
      }
    });
    
    return rules;
  }

  private static detectSalesAnomalies(
    salesData: { date: string; product: string; units_sold: number; revenue: number; price: number }[]
  ) {
    // Group by product
    const productGroups = _.groupBy(salesData, 'product');
    
    const anomalies: {
      date: string;
      product: string;
      units_sold: number;
      z_score: number;
      type: string;
    }[] = [];
    
    Object.entries(productGroups).forEach(([product, items]) => {
      const unitsSold = items.map(item => item.units_sold);
      const mean = _.mean(unitsSold);
      const std = math.std(unitsSold) as unknown as number;
      const threshold = 2.5; // Z-score threshold for anomalies
      
      items.forEach(item => {
        const zScore = Math.abs((item.units_sold - mean) / std);
        
        if (zScore > threshold) {
          anomalies.push({
            date: item.date,
            product: item.product,
            units_sold: item.units_sold,
            z_score: zScore,
            type: item.units_sold > mean ? 'unusually high' : 'unusually low'
          });
        }
      });
    });
    
    return anomalies;
  }

  private static detectPriceAnomalies(
    salesData: { date: string; product: string; units_sold: number; revenue: number; price: number }[]
  ) {
    // Group by product
    const productGroups = _.groupBy(salesData, 'product');
    
    const anomalies: {
      date: string;
      product: string;
      price: number;
      z_score: number;
      type: string;
    }[] = [];
    
    Object.entries(productGroups).forEach(([product, items]) => {
      const prices = items.map(item => item.price);
      const mean = _.mean(prices);
      const std = math.std(prices) as unknown as number;
      const threshold = 2; // Z-score threshold for price anomalies
      
      items.forEach(item => {
        const zScore = Math.abs((item.price - mean) / std);
        
        if (zScore > threshold) {
          anomalies.push({
            date: item.date,
            product: item.product,
            price: item.price,
            z_score: zScore,
            type: item.price > mean ? 'unusually high' : 'unusually low'
          });
        }
      });
    });
    
    return anomalies;
  }

  private static groupByDemographic(data: BusinessData[]) {
    return _.groupBy(data, 'Customer_Demographic');
  }

  private static generateCompetitiveInsights(
    priceComparisons: any[],
    marketShare: any[],
    data: (BusinessData & { DateObj: Date })[]
  ) {
    // Generate overall competitive position
    const competitiveProducts = priceComparisons.filter(p => p.is_price_competitive);
    const nonCompetitiveProducts = priceComparisons.filter(p => !p.is_price_competitive);
    
    // Calculate promotion effectiveness
    const promotionEffectiveness = this.calculatePromotionEffectiveness(data);
    
    // Generate insights
    const insights = [
      {
        area: 'Price Competitiveness',
        insight: `${competitiveProducts.length} out of ${priceComparisons.length} products are price competitive`,
        recommendations: [
          'Focus marketing on price competitive products',
          nonCompetitiveProducts.length > 0 ? 
            `Consider price adjustments for ${nonCompetitiveProducts.map(p => p.product).join(', ')}` : 
            'Maintain current pricing strategy'
        ]
      },
      {
        area: 'Market Position',
        insight: `Highest market share: ${_.maxBy(marketShare, 'market_share')?.store} (${(_.maxBy(marketShare, 'market_share')?.market_share * 100).toFixed(2)}%)`,
        recommendations: [
          'Leverage high-performing stores for best practice sharing',
          'Investigate underperforming stores for improvement opportunities'
        ]
      },
      {
        area: 'Promotion Strategy',
        insight: `Promotions ${promotionEffectiveness.effective ? 'are' : 'are not'} effective at driving sales (avg lift: ${promotionEffectiveness.avgLift.toFixed(2)}x)`,
        recommendations: promotionEffectiveness.recommendations
      }
    ];
    
    return insights;
  }

  private static calculatePromotionEffectiveness(data: (BusinessData & { DateObj: Date })[]) {
    // Group by product
    const productGroups = _.groupBy(data, 'Product');
    
    const promotionImpacts: Array<{
      product: string;
      avg_promo_sales: number;
      avg_non_promo_sales: number;
      lift: number;
    }> = [];
    
    Object.entries(productGroups).forEach(([product, items]) => {
      const promoItems = items.filter(item => item.Promotion_Active === 1);
      const nonPromoItems = items.filter(item => item.Promotion_Active === 0);
      
      if (promoItems.length > 0 && nonPromoItems.length > 0) {
        const avgPromoSales = _.meanBy(promoItems, 'Units_Sold');
        const avgNonPromoSales = _.meanBy(nonPromoItems, 'Units_Sold');
        const lift = avgPromoSales / avgNonPromoSales;
        
        promotionImpacts.push({
          product,
          avg_promo_sales: avgPromoSales,
          avg_non_promo_sales: avgNonPromoSales,
          lift
        });
      }
    });
    
    const avgLift = _.meanBy(promotionImpacts, 'lift');
    const effective = avgLift > 1.2; // Consider effective if 20% lift on average
    
    const recommendations = [];
    if (effective) {
      recommendations.push('Continue current promotion strategy');
      
      // Find most effective promotions
      const mostEffective = _.orderBy(promotionImpacts, 'lift', 'desc').slice(0, 3);
      if (mostEffective.length > 0) {
        recommendations.push(`Focus promotions on high-impact products: ${mostEffective.map(p => p.product).join(', ')}`);
      }
    } else {
      recommendations.push('Review and revise promotion strategy');
      recommendations.push('Test different promotion types or discount levels');
      recommendations.push('Consider loyalty-based promotions instead of general discounts');
    }
    
    return {
      effective,
      avgLift,
      productImpacts: promotionImpacts,
      recommendations
    };
  }
}

export class RetailAnalytics {
  static async analyzeData(data: BusinessData[]) {
    return {
      salesAnalysis: this.analyzeSales(data),
      customerSegments: this.segmentCustomers(data),
      inventoryInsights: this.analyzeInventory(data),
      predictions: this.makePredictions(data),
      competitiveAnalysis: this.analyzeCompetition(data)
    }
  }

  // 1. Moving Average for Sales Prediction
  private static makePredictions(data: BusinessData[]) {
    const salesByDate = this.groupByDate(data)
    const dates = Object.keys(salesByDate).sort()
    const salesValues = dates.map(date => salesByDate[date].totalSales)
    
    // Calculate 7-day moving average
    const movingAverage = this.calculateMovingAverage(salesValues, 7)
    
    // Simple exponential smoothing for predictions
    const alpha = 0.2 // smoothing factor
    const predictions = this.exponentialSmoothing(salesValues, alpha, 30)

    return {
      historical: dates.map((date, i) => ({
        date,
        actual: salesValues[i],
        moving_average: movingAverage[i] || null
      })),
      forecast: predictions.map((value, i) => ({
        date: this.addDays(dates[dates.length - 1], i + 1),
        predicted: value
      }))
    }
  }

  // 2. RFM Customer Segmentation
  private static segmentCustomers(data: BusinessData[]) {
    const customerData = this.groupByDemographic(data)
    const segments = Object.entries(customerData).map(([demographic, stats]) => {
      // Calculate RFM scores - convert date to days since last purchase
      const lastPurchaseDate = DateTime.fromFormat(stats.lastPurchaseDate, 'dd/MM/yyyy')
      const today = DateTime.now()
      const recencyDays = Math.floor(today.diff(lastPurchaseDate, 'days').days)
      const frequency = stats.totalTransactions
      const monetary = stats.totalRevenue

      // Simple scoring system (1-5 for each metric)
      const rScore = this.calculateScore(recencyDays, 'desc')
      const fScore = this.calculateScore(frequency, 'asc')
      const mScore = this.calculateScore(monetary, 'asc')

      const totalScore = (rScore + fScore + mScore) / 3

      return {
        demographic,
        segment: totalScore >= 4 ? 'High-Value' :
                 totalScore >= 3 ? 'Mid-Value' : 'Low-Value',
        metrics: { recency: recencyDays, frequency, monetary },
        score: totalScore
      }
    })

    return segments
  }

  // 3. ABC Analysis for Inventory
  private static analyzeInventory(data: BusinessData[]) {
    // Group by product for detailed analysis
    const productGroups = data.reduce((acc, item) => {
      if (!acc[item.Product]) {
        acc[item.Product] = []
      }
      acc[item.Product].push(item)
      return acc
    }, {} as Record<string, BusinessData[]>)

    // Calculate metrics for each product
    const inventoryMetrics = Object.entries(productGroups).map(([product, items]) => {
      // Calculate key metrics
      const revenue = items.reduce((sum, item) => sum + item.Revenue_BWP, 0)
      const currentStock = items[items.length - 1].Stock_Level
      const avgDailySales = items.reduce((sum, item) => sum + item.Units_Sold, 0) / items.length
      const avgLeadTime = items.reduce((sum, item) => sum + item.Lead_Time_Days, 0) / items.length
      
      // Calculate safety stock and reorder point
      const standardDeviation = Math.sqrt(
        items.reduce((sum, item) => 
          sum + Math.pow(item.Units_Sold - avgDailySales, 2), 0
        ) / items.length
      )
      
      const safetyStock = Math.ceil(1.96 * standardDeviation * Math.sqrt(avgLeadTime))
      const reorderPoint = Math.ceil(avgDailySales * avgLeadTime + safetyStock)

      return {
        product,
        revenue,
        metrics: {
          stock_level: currentStock,
          reorder_point: reorderPoint,
          avg_daily_sales: avgDailySales,
          lead_time: avgLeadTime,
          safety_stock: safetyStock,
          stock_coverage: currentStock / avgDailySales // Days of inventory
        }
      }
    })

    // Calculate total revenue for percentage calculations
    const totalRevenue = inventoryMetrics.reduce((sum, item) => sum + item.revenue, 0)

    // Add percentages and sort for ABC classification
    const enrichedMetrics = inventoryMetrics
      .map(item => ({
        ...item,
        percentage: (item.revenue / totalRevenue) * 100
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Apply ABC classification
    let cumulativePercent = 0
    return enrichedMetrics.map(item => {
      cumulativePercent += item.percentage
      return {
        ...item,
        category: cumulativePercent <= 70 ? 'A' :
                 cumulativePercent <= 90 ? 'B' : 'C'
      }
    })
  }

  // 4. Competitive Price Analysis
  private static analyzeCompetition(data: BusinessData[]) {
    const productStats = this.groupByProduct(data)
    
    return Object.entries(productStats).map(([product, stats]) => {
      const priceDiff = stats.avgPrice - stats.avgCompetitionPrice
      const priceIndex = (stats.avgPrice / stats.avgCompetitionPrice) * 100

      return {
        product,
        metrics: {
          our_price: stats.avgPrice,
          competition_price: stats.avgCompetitionPrice,
          price_difference: priceDiff,
          price_index: priceIndex,
          is_competitive: priceIndex <= 105 // within 5% of competition
        },
        sales_impact: {
          units_sold: stats.unitsSold,
          revenue: stats.revenue,
          margin: ((stats.avgPrice - stats.avgCompetitionPrice) / stats.avgPrice) * 100
        }
      }
    })
  }

  // Helper Methods
  private static groupByDate(data: BusinessData[]) {
    return data.reduce((acc, item) => {
      const date = item.Date
      if (!acc[date]) {
        acc[date] = { totalSales: 0, transactions: 0 }
      }
      acc[date].totalSales += item.Units_Sold
      acc[date].transactions += 1
      return acc
    }, {} as Record<string, { totalSales: number, transactions: number }>)
  }

  private static calculateMovingAverage(data: number[], window: number) {
    return data.map((_, index) => {
      if (index < window - 1) return null
      const slice = data.slice(index - window + 1, index + 1)
      return slice.reduce((sum, val) => sum + val, 0) / window
    })
  }

  private static exponentialSmoothing(data: number[], alpha: number, horizon: number) {
    let lastValue = data[data.length - 1]
    const predictions = []

    for (let i = 0; i < horizon; i++) {
      lastValue = alpha * data[data.length - 1] + (1 - alpha) * lastValue
      predictions.push(lastValue)
    }

    return predictions
  }

  private static addDays(dateStr: string, days: number) {
    return DateTime.fromFormat(dateStr, 'dd/MM/yyyy')
      .plus({ days })
      .toFormat('dd/MM/yyyy')
  }

  private static calculateScore(value: number, direction: 'asc' | 'desc'): number {
    // Implement quintile scoring
    return Math.ceil(Math.random() * 5) // Simplified for example
  }

  private static groupByDemographic(data: BusinessData[]) {
    interface DemographicStats {
      totalRevenue: number;
      totalTransactions: number;
      lastPurchaseDate: string;
    }

    return data.reduce((acc, item) => {
      const demo = item.Customer_Demographic
      if (!acc[demo]) {
        acc[demo] = {
          totalRevenue: 0,
          totalTransactions: 0,
          lastPurchaseDate: item.Date
        }
      }
      acc[demo].totalRevenue += item.Revenue_BWP
      acc[demo].totalTransactions += 1
      acc[demo].lastPurchaseDate = this.maxDate(acc[demo].lastPurchaseDate, item.Date)
      return acc
    }, {} as Record<string, DemographicStats>)
  }

  private static groupByProduct(data: BusinessData[]) {
    return data.reduce((acc, item) => {
      const product = item.Product
      if (!acc[product]) {
        acc[product] = {
          revenue: 0,
          unitsSold: 0,
          avgPrice: 0,
          avgCompetitionPrice: 0,
          transactions: 0
        }
      }
      acc[product].revenue += item.Revenue_BWP
      acc[product].unitsSold += item.Units_Sold
      acc[product].transactions += 1
      acc[product].avgPrice = (acc[product].avgPrice * (acc[product].transactions - 1) + 
        item.Price_per_Unit_BWP) / acc[product].transactions
      acc[product].avgCompetitionPrice = (acc[product].avgCompetitionPrice * 
        (acc[product].transactions - 1) + item.Competition_Price_BWP) / acc[product].transactions
      return acc
    }, {} as Record<string, any>)
  }

  private static maxDate(date1: string, date2: string): string {
    return DateTime.fromFormat(date1, 'dd/MM/yyyy') > 
           DateTime.fromFormat(date2, 'dd/MM/yyyy') ? date1 : date2
  }

  private static analyzeSales(data: BusinessData[]) {
    // Group sales by various dimensions
    const salesByProduct = this.groupByProduct(data);
    const salesByDate = this.groupByDate(data);

    // Calculate key metrics
    const totalRevenue = data.reduce((sum, item) => sum + item.Revenue_BWP, 0);
    const totalUnits = data.reduce((sum, item) => sum + item.Units_Sold, 0);
    const avgTicketSize = totalRevenue / Object.keys(salesByDate).length;

    // Top performing products
    const topProducts = Object.entries(salesByProduct)
      .map(([product, stats]) => ({
        product,
        revenue: stats.revenue,
        units: stats.unitsSold,
        average_price: stats.avgPrice
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      overall_metrics: {
        total_revenue: totalRevenue,
        total_units: totalUnits,
        average_ticket_size: avgTicketSize
      },
      top_products: topProducts,
      daily_sales: Object.entries(salesByDate).map(([date, stats]) => ({
        date,
        units_sold: stats.totalSales,
        transactions: stats.transactions
      }))
    };
  }
}