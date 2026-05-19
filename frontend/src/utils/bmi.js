/**
 * BMI Calculation Utilities
 */

/**
 * Calculate BMI from weight and height
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI value rounded to 1 decimal
 */
export const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    return Math.round(bmi * 10) / 10;
};

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {Object} Category info
 */
export const getBMICategory = (bmi) => {
    if (bmi < 18.5) {
        return {
            category: 'underweight',
            label: 'Underweight',
            color: 'blue',
            range: '< 18.5',
            advice: 'You are underweight. Focus on nutrient-rich foods and strength training.',
            emoji: '🔵'
        };
    } else if (bmi < 25) {
        return {
            category: 'normal',
            label: 'Normal',
            color: 'green',
            range: '18.5 - 24.9',
            advice: 'Great! You are at a healthy weight. Maintain with balanced diet.',
            emoji: '🟢'
        };
    } else if (bmi < 30) {
        return {
            category: 'overweight',
            label: 'Overweight',
            color: 'yellow',
            range: '25 - 29.9',
            advice: 'You are slightly above healthy range. Consider moderate calorie deficit.',
            emoji: '🟡'
        };
    } else {
        return {
            category: 'obese',
            label: 'Obese',
            color: 'red',
            range: '≥ 30',
            advice: 'Consult a healthcare provider. Focus on gradual weight loss.',
            emoji: '🔴'
        };
    }
};

/**
 * Calculate ideal weight range
 * @param {number} height - Height in cm
 * @returns {Object} Min and max ideal weight
 */
export const getIdealWeightRange = (height) => {
    const heightInM = height / 100;
    const min = 18.5 * (heightInM * heightInM);
    const max = 24.9 * (heightInM * heightInM);
    return {
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10
    };
};

/**
 * Calculate BMR (Basal Metabolic Rate)
 */
export const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
};

/**
 * Calculate TDEE with activity multiplier
 */
export const calculateTDEE = (bmr, activityLevel) => {
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.55));
};

/**
 * Get calorie target based on goal
 */
export const getCalorieTarget = (tdee, goal) => {
    switch(goal) {
        case 'fatLoss':
            return Math.max(1200, tdee - 500);
        case 'muscleGain':
            return tdee + 300;
        default:
            return tdee;
    }
};