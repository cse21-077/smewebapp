import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Define interfaces for different data types
interface SalesData {
  date: string | Date;
  amount: number;
  quantity: number;
  product?: string;
  [key: string]: any;
}

interface CustomerData {
  id?: string;
  _id?: string;
  name?: string;
  customerName?: string;
  purchases: number;
  spent: number;
  [key: string]: any;
}

interface InventoryData {
  id?: string;
  _id?: string;
  name?: string;
  productName?: string;
  quantity: number;
  reorderLevel?: number;
  salesRate?: number;
  cost?: number;
  [key: string]: any;
}

// Environment validation
const getDbClient = async (): Promise<MongoClient> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in environment variables");
  return await MongoClient.connect(uri);
};

// Function to process sales data with more advanced analytics
async function processSalesData(data: any[]): Promise<any> {
  try {
    // Ensure we have enough data to process
    if (!data || data.length < 3) {
      return {
        error: "insufficient_data",
        message: "Not enough sales data to generate insights. Please upload more data."
      };
    }

    // Step 1: Process and clean historical data
    const processedData: SalesData[] = data.map(item => {
      const parsedDate = new Date(item.date);
      return {
        ...item,
        date: parsedDate,
        amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0'),
        quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || '0', 10)
      };
    }).filter(item => !isNaN(item.amount) && !isNaN(item.quantity) && !isNaN((item.date as Date).getTime()));

    // Exit early if we don't have enough valid data points
    if (processedData.length < 3) {
      return {
        error: "invalid_data",
        message: "Sales data contains too many invalid entries. Please check your data format."
      };
    }

    // Sort by date
    processedData.sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

    // Step 2: Extract features for ML processing
    interface EnrichedSalesData extends SalesData {
      dayOfWeek: number;
      month: number;
      trend: number;
    }

    const enrichedData: EnrichedSalesData[] = processedData.map((item, index, arr) => {
      const date = item.date as Date;
      const dayOfWeek = date.getDay();
      const month = date.getMonth();
      const prevAmount = index > 0 ? arr[index - 1].amount : item.amount;
      const trend = (item.amount - prevAmount) / (prevAmount || 1);

      return {
        ...item,
        dayOfWeek,
        month,
        trend
      };
    });

    // Step 3: Simple time series forecasting with regression
    // This simulates what XGBoost would do with a simpler algorithm
    const lastDate = new Date(processedData[processedData.length - 1].date as Date);

    interface Prediction {
      date: string;
      predicted: number;
      predictedQuantity: number;
      confidence: number;
    }

    const predictions: Prediction[] = [];

    // Calculate some statistics for use in predictions
    const recentData = processedData.slice(-Math.min(30, processedData.length));
    const avgAmount = recentData.reduce((sum, d) => sum + d.amount, 0) / recentData.length;
    const avgQuantity = recentData.reduce((sum, d) => sum + d.quantity, 0) / recentData.length;

    // Calculate weekly and monthly patterns
    const weekdayFactors = Array(7).fill(0).map((_, i) => {
      const dayData = recentData.filter(d => (d.date as Date).getDay() === i);
      if (dayData.length === 0) return 1;
      return dayData.reduce((sum, d) => sum + d.amount, 0) / dayData.length / avgAmount;
    });

    const monthlyFactors = Array(12).fill(0).map((_, i) => {
      const monthData = recentData.filter(d => (d.date as Date).getMonth() === i);
      if (monthData.length === 0) return 1;
      return monthData.reduce((sum, d) => sum + d.amount, 0) / monthData.length / avgAmount;
    });

    // Generate predictions for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const predictionDate = new Date(lastDate);
      predictionDate.setDate(lastDate.getDate() + i);

      const dayOfWeek = predictionDate.getDay();
      const month = predictionDate.getMonth();

      // Use patterns to make forecast
      const dayFactor = weekdayFactors[dayOfWeek] || 1;
      const monthFactor = monthlyFactors[month] || 1;

      // Add trend component
      const avgTrend = enrichedData.slice(-10).reduce((sum, d) => sum + d.trend, 0) / 10;
      const trendFactor = 1 + (avgTrend * Math.min(i/5, 1));

      // Calculate final prediction with a small random component for visualization
      const predictedSales = avgAmount * dayFactor * monthFactor * trendFactor * (1 + (Math.random() * 0.05 - 0.025));
      const predictedQuantity = avgQuantity * dayFactor * monthFactor * trendFactor * (1 + (Math.random() * 0.05 - 0.025));

      // Calculate confidence based on data quality and prediction distance
      const confidence = Math.max(0.5, 0.9 - (i/100));

      predictions.push({
        date: predictionDate.toISOString().split('T')[0],
        predicted: Math.round(predictedSales * 100) / 100,
        predictedQuantity: Math.round(predictedQuantity),
        confidence
      });
    }

    // Calculate overall metrics
    const totalSales = processedData.reduce((sum, item) => sum + item.amount, 0);
    const totalQuantity = processedData.reduce((sum, item) => sum + item.quantity, 0);
    const avgSale = totalSales / processedData.length;
    const lastMonthSales = processedData
      .filter(d => d.date >= new Date(lastDate.getFullYear(), lastDate.getMonth()-1, lastDate.getDate()))
      .reduce((sum, d) => sum + d.amount, 0);
    const prevMonthSales = processedData
      .filter(d => {
        const twoMonthsAgo = new Date(lastDate.getFullYear(), lastDate.getMonth()-2, lastDate.getDate());
        const oneMonthAgo = new Date(lastDate.getFullYear(), lastDate.getMonth()-1, lastDate.getDate());
        return d.date >= twoMonthsAgo && d.date < oneMonthAgo;
      })
      .reduce((sum, d) => sum + d.amount, 0);

    const monthlyGrowth = prevMonthSales > 0 ?
      ((lastMonthSales / prevMonthSales) - 1) * 100 : 0;

    // Top selling products
    interface ProductSale {
      product: string;
      amount: number;
    }

    const productSales: Record<string, number> = {};
    processedData.forEach(item => {
      if (item.product) {
        productSales[item.product] = (productSales[item.product] || 0) + item.amount;
      }
    });

    const topProducts: ProductSale[] = Object.entries(productSales)
      .map(([product, amount]) => ({ product, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Build the response
    return {
      historicalData: processedData.map(item => ({
        date: (item.date as Date).toISOString().split('T')[0],
        amount: item.amount,
        quantity: item.quantity,
        product: item.product
      })),
      predictions,
      topProducts,
      metrics: {
        avgSale: Math.round(avgSale * 100) / 100,
        totalSales: Math.round(totalSales * 100) / 100,
        totalQuantity,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
        predictedGrowth: Math.round((predictions[predictions.length-1].predicted / processedData[processedData.length-1].amount - 1) * 100 * 10) / 10
      }
    };
  } catch (error) {
    console.error("Sales processing error:", error);
    return {
      error: "processing_error",
      message: `Error processing sales data: ${(error as Error).message}`
    };
  }
}

// Function to process customer data
async function processCustomerData(data: any[]): Promise<any> {
  try {
    // Check if we have enough data
    if (!data || data.length < 3) {
      return {
        error: "insufficient_data",
        message: "Not enough customer data to generate insights. Please upload more data."
      };
    }

    // Clean and validate the data
    const customers: CustomerData[] = data.map(customer => ({
      ...customer,
      // Ensure numeric values
      purchases: typeof customer.purchases === 'number' ? customer.purchases : parseInt(customer.purchases || '0', 10),
      spent: typeof customer.spent === 'number' ? customer.spent : parseFloat(customer.spent || '0')
    })).filter(customer => !isNaN(customer.purchases) && !isNaN(customer.spent));

    if (customers.length < 3) {
      return {
        error: "invalid_data",
        message: "Customer data contains too many invalid entries. Please check your data format."
      };
    }

    // Calculate RFM (Recency, Frequency, Monetary) scores
    // Using a simplified approach here
    interface CustomerSegments {
      "High Value": CustomerData[];
      "Mid Value": CustomerData[];
      "Low Value": CustomerData[];
      [key: string]: CustomerData[];
    }

    const segments: CustomerSegments = {
      "High Value": [],
      "Mid Value": [],
      "Low Value": []
    };

    // Segment customers based on spending and purchase frequency
    customers.forEach(customer => {
      const avgSpent = customer.spent / Math.max(1, customer.purchases);
      if (avgSpent > 100 && customer.purchases > 5) {
        segments["High Value"].push(customer);
      } else if (avgSpent > 50 || customer.purchases > 3) {
        segments["Mid Value"].push(customer);
      } else {
        segments["Low Value"].push(customer);
      }
    });

    // Calculate metrics
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.spent, 0);
    const avgLifetimeValue = totalRevenue / totalCustomers;

    // Identify trends and insights
    const highValuePercentage = (segments["High Value"].length / totalCustomers) * 100;
    const midValuePercentage = (segments["Mid Value"].length / totalCustomers) * 100;
    const lowValuePercentage = (segments["Low Value"].length / totalCustomers) * 100;

    // Top customers
    interface TopCustomer {
      id: string;
      name: string;
      spent: number;
      purchases: number;
    }

    const topCustomers: TopCustomer[] = [...customers]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
      .map(c => ({
        id: c.id || c._id || '',
        name: c.name || c.customerName || `Customer ${c.id || c._id || ''}`,
        spent: Math.round(c.spent * 100) / 100,
        purchases: c.purchases
      }));

    return {
      segments: {
        "High Value": segments["High Value"].length,
        "Mid Value": segments["Mid Value"].length,
        "Low Value": segments["Low Value"].length
      },
      segmentPercentages: {
        "High Value": Math.round(highValuePercentage * 10) / 10,
        "Mid Value": Math.round(midValuePercentage * 10) / 10,
        "Low Value": Math.round(lowValuePercentage * 10) / 10
      },
      segmentRevenue: {
        "High Value": Math.round(segments["High Value"].reduce((sum, c) => sum + c.spent, 0) * 100) / 100,
        "Mid Value": Math.round(segments["Mid Value"].reduce((sum, c) => sum + c.spent, 0) * 100) / 100,
        "Low Value": Math.round(segments["Low Value"].reduce((sum, c) => sum + c.spent, 0) * 100) / 100
      },
      topCustomers,
      metrics: {
        totalCustomers,
        avgLifetimeValue: Math.round(avgLifetimeValue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgOrderValue: Math.round((totalRevenue / customers.reduce((sum, c) => sum + c.purchases, 0)) * 100) / 100
      }
    };
  } catch (error) {
    console.error("Customer processing error:", error);
    return {
      error: "processing_error",
      message: `Error processing customer data: ${(error as Error).message}`
    };
  }
}

// Function to process inventory data
async function processInventoryData(data: any[]): Promise<any> {
  try {
    // Check if we have enough data
    if (!data || data.length < 2) {
      return {
        error: "insufficient_data",
        message: "Not enough inventory data to generate insights. Please upload more data."
      };
    }

    // Process inventory and make restocking predictions
    const inventory: InventoryData[] = data.map(item => ({
      ...item,
      // Ensure numeric values
      quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || '0', 10),
      reorderLevel: typeof item.reorderLevel === 'number' ? item.reorderLevel : parseInt(item.reorderLevel || '0', 10),
      salesRate: typeof item.salesRate === 'number' ? item.salesRate : parseFloat(item.salesRate || '0')
    })).filter(item => !isNaN(item.quantity));

    if (inventory.length < 2) {
      return {
        error: "invalid_data",
        message: "Inventory data contains too many invalid entries. Please check your data format."
      };
    }

    // For items missing reorder level, set a default based on current quantity
    inventory.forEach(item => {
      if (!item.reorderLevel || isNaN(item.reorderLevel)) {
        item.reorderLevel = Math.max(5, Math.floor(item.quantity * 0.2));
      }

      // If sales rate is missing, estimate it based on historical data or use a default
      if (!item.salesRate || isNaN(item.salesRate)) {
        item.salesRate = 1; // Default to 1 unit per day if no data
      }
    });

    // Analyze inventory status
    interface InventoryStatus extends InventoryData {
      daysUntilReorder: number;
      status: "Critical" | "Warning" | "Good";
    }

    const inventoryStatus: InventoryStatus[] = inventory.map(item => {
      const daysUntilReorder = item.salesRate && item.salesRate > 0 ?
        Math.round((item.quantity - (item.reorderLevel || 0)) / item.salesRate) :
        999; // If no sales rate, assume no reordering needed soon

      return {
        ...item,
        daysUntilReorder,
        status: daysUntilReorder <= 7 ? "Critical" : daysUntilReorder <= 30 ? "Warning" : "Good"
      };
    });

    const categorized = {
      critical: inventoryStatus.filter(item => item.status === "Critical"),
      warning: inventoryStatus.filter(item => item.status === "Warning"),
      good: inventoryStatus.filter(item => item.status === "Good")
    };

    // Calculate optimal reorder quantities using EOQ (Economic Order Quantity) formula
    // This is a simplified version - a real implementation would need more data
    interface ReorderRecommendation {
      id: string;
      name: string;
      currentStock: number;
      reorderLevel: number;
      daysRemaining: number;
      recommendedOrder: number;
    }

    const reorderRecommendations: ReorderRecommendation[] = categorized.critical.map(item => {
      // Simple EOQ calculation (sqrt(2DS/H)) where:
      // D = Annual demand (salesRate * 365)
      // S = Order cost (using a default value)
      // H = Holding cost (using a default percentage of item value)
      const annualDemand = (item.salesRate || 0) * 365;
      const orderCost = 25; // Default fixed cost per order
      const unitCost = item.cost || 10; // Default if cost isn't provided
      const holdingRate = 0.25; // 25% of unit cost per year
      const holdingCost = unitCost * holdingRate;

      const eoq = Math.round(Math.sqrt((2 * annualDemand * orderCost) / holdingCost)) || 0;

      // Ensure minimum order quantity
      const recommendedOrder = Math.max(eoq, (item.reorderLevel || 0) * 2);

      return {
        id: item.id || item._id || '',
        name: item.name || item.productName || `Product ${item.id || item._id || ''}`,
        currentStock: item.quantity,
        reorderLevel: item.reorderLevel || 0,
        daysRemaining: item.daysUntilReorder,
        recommendedOrder
      };
    });

    interface LowStockItem {
      id: string;
      name: string;
      currentStock: number;
      daysRemaining: number;
    }

    const lowStock: LowStockItem[] = categorized.critical.map(item => ({
      id: item.id || item._id || '',
      name: item.name || item.productName || `Product ${item.id || item._id || ''}`,
      currentStock: item.quantity,
      daysRemaining: item.daysUntilReorder
    }));

    return {
      inventoryStatus: {
        critical: categorized.critical.length,
        warning: categorized.warning.length,
        good: categorized.good.length
      },
      needsReorder: reorderRecommendations,
      lowStock,
      metrics: {
        totalItems: inventory.length,
        totalStock: inventory.reduce((sum, item) => sum + item.quantity, 0),
        averageStock: Math.round(inventory.reduce((sum, item) => sum + item.quantity, 0) / inventory.length),
        stockValue: Math.round(inventory.reduce((sum, item) => sum + (item.quantity * (item.cost || 0)), 0) * 100) / 100
      }
    };
  } catch (error) {
    console.error("Inventory processing error:", error);
    return {
      error: "processing_error",
      message: `Error processing inventory data: ${(error as Error).message}`
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { dataType } = await req.json() as { dataType: string };
    const collectionName = `${dataType}_data`;

    console.log(`Processing ${dataType} data`);

    // Get data from MongoDB
    const client = await getDbClient();
    const db = client.db("predictiq");
    const collection = db.collection(collectionName);

    // Get all documents from the collection
    const data = await collection.find({}).toArray();

    // Check if we have data to process
    if (!data || data.length === 0) {
      await client.close();
      return NextResponse.json({
        type: dataType,
        processed: false,
        error: "no_data",
        message: `No ${dataType} data found. Please upload data first.`
      });
    }

    // Process the data based on type
    let results;
    switch (dataType) {
      case "sales":
        results = await processSalesData(data);
        break;
      case "customer":
        results = await processCustomerData(data);
        break;
      case "inventory":
        results = await processInventoryData(data);
        break;
      default:
        await client.close();
        return NextResponse.json(
          { error: "Unsupported data type" },
          { status: 400 }
        );
    }

    await client.close();

    // Check if processing returned an error
    if (results && results.error) {
      return NextResponse.json({
        type: dataType,
        processed: false,
        error: results.error,
        message: results.message
      });
    }

    // Return processed results
    return NextResponse.json({
      type: dataType,
      processed: true,
      results
    });
  } catch (err: unknown) {
    console.error(`Processing error for ${req.nextUrl.searchParams.get("type")}:`, err);
    return NextResponse.json({
      error: "processing_error",
      message: (err as Error).message
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const dataType = req.nextUrl.searchParams.get("type");

    if (!dataType) {
      return NextResponse.json(
        { error: "Data type parameter is required" },
        { status: 400 }
      );
    }

    // This endpoint will return any previously processed predictions stored in DB
    // For simplicity in this example, we'll just trigger the processing

    const dummyRequest = {
      json: async () => ({ dataType })
    } as NextRequest;

    // Reuse the POST handler to process data
    return await POST(dummyRequest);
  } catch (err: unknown) {
    return NextResponse.json({
      error: (err as Error).message
    }, { status: 500 });
  }
}
