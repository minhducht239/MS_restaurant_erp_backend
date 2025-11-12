export const generateRevenueData = (actualData = []) => {
  const monthLabels = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  // Use actual data if provided, otherwise use sample data
  const revenueData =
    actualData.length === 12
      ? actualData
      : [
          15000000, 20000000, 25000000, 30000000, 35000000, 40000000, 45000000, 50000000, 55000000,
          60000000, 65000000, 70000000,
        ];

  return {
    labels: monthLabels,
    datasets: {
      label: "VND",
      data: revenueData,
    },
  };
};

export default generateRevenueData;
