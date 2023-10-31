export function convertDateFormat(inputDate) {
  if (inputDate === "") {
    return;
  }
  const [year, month, day] = inputDate.split("-");
  const dateObject = new Date(year, parseInt(month) - 1, day);
  const formattedMonth = (dateObject.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const formattedDay = dateObject.getDate().toString().padStart(2, "0");
  const formattedDate = `${formattedMonth}/${formattedDay}/${year}`;
  return formattedDate;
}

export function convertDateTimeString(dateString, timeString) {
  if (dateString === "") {
    return;
  }
  if (timeString === "") {
    return;
  }

  const formattedDate = dateString + "T" + timeString;
  const localDate = new Date(formattedDate);

  return localDate;
}

export function getBudgetByCategory(data) {
  const totalCostByCategory = {};

  data.forEach((budget) => {
    if (totalCostByCategory[budget.BudgetCategory]) {
      totalCostByCategory[budget.BudgetCategory] += budget.Cost;
    } else {
      totalCostByCategory[budget.BudgetCategory] = budget.Cost;
    }
  });

  const result = Object.keys(totalCostByCategory).map((BudgetCategory) => ({
    BudgetCategory,
    Cost: totalCostByCategory[BudgetCategory],
  }));

  return result;
}

export function getBudgetPieChartData(budgetData, totalCost, totalBudget) {
  if (totalBudget === 0) {
    return;
  }

  const list = [];
  budgetData.forEach((doc) => {
    var data = {
      x: doc.BudgetCategory,
      y: doc.Cost,
      text: Math.round((doc.Cost / totalBudget) * 100) + "%",
    };
    list.push(data);
  });

  const costDifference = totalBudget - totalCost;

  if (costDifference > 0) {
    var remainingData = {
      x: "Remaining Budget",
      y: costDifference,
      text: Math.round((costDifference / totalBudget) * 100) + "%",
    };
    list.push(remainingData);
  }

  return list;
}

export function convertTo12HourFormat(time24) {
  const parts = time24.split(":");
  const hours24 = parseInt(parts[0]);
  const minutes = parts[1];

  if (hours24 === 0) {
    return `12:${minutes} AM`;
  } else if (hours24 < 12) {
    return `${hours24}:${minutes} AM`;
  } else if (hours24 === 12) {
    return `12:${minutes} PM`;
  } else {
    const hours12 = hours24 - 12;
    return `${hours12}:${minutes} PM`;
  }
}

export function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  let newEndDate = new Date(endDate);

  while (currentDate <= newEndDate) {
    const localFormattedDate = new Date(currentDate);
    localFormattedDate.setDate(localFormattedDate.getDate() + 1);

    dates.push(formatDateToYYYYMMDD(localFormattedDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function getDayOfTheWeek(Day) {
  // Create a Date object
  var date = new Date(Day); // Use your desired date

  // Get the day of the week
  var dayOfWeek = date.getDay();

  // Define an array of day names
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get the day name using the dayOfWeek value
  var dayName = days[dayOfWeek];

  return dayName;
}
