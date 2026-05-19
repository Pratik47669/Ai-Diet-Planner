/**
 * BMI Calculator Utility
 * Calculates BMI and provides category with health advice
 */

/**
 * Calculate BMI from weight and height
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI value rounded to 1 decimal
 */
export const calculateBMI = (weight, height) => {
    if (!weight || !height || weight <= 0 || height <= 0) {
        throw new Error('Invalid weight or height values');
    }
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    return Math.round(bmi * 10) / 10;
};

/**
 * Get BMI category based on value
 * @param {number} bmi - BMI value
 * @returns {Object} Category info with label, color, and advice
 */
export const getBMICategory = (bmi) => {
    if (bmi < 18.5) {
        return {
            category: 'underweight',
            label: 'Underweight',
            color: '#3b82f6', // blue
            emoji: '🔵',
            range: '< 18.5',
            advice: 'You are underweight. Focus on nutrient-rich foods and strength training to gain healthy weight.',
            risks: ['Nutritional deficiencies', 'Weakened immune system', 'Osteoporosis'],
            recommendations: [
                'Increase calorie intake with healthy foods',
                'Add protein-rich foods to every meal',
                'Include healthy fats like nuts and avocados',
                'Strength training 3-4 times per week'
            ]
        };
    } else if (bmi < 25) {
        return {
            category: 'normal',
            label: 'Normal',
            color: '#22c55e', // green
            emoji: '🟢',
            range: '18.5 - 24.9',
            advice: 'Great! You are at a healthy weight. Maintain with balanced diet and regular exercise.',
            risks: ['Low risk of weight-related diseases'],
            recommendations: [
                'Maintain current eating habits',
                'Regular exercise 3-5 times per week',
                'Stay hydrated with 8-10 glasses of water',
                'Get adequate sleep (7-8 hours)'
            ]
        };
    } else if (bmi < 30) {
        return {
            category: 'overweight',
            label: 'Overweight',
            color: '#eab308', // yellow
            emoji: '🟡',
            range: '25 - 29.9',
            advice: 'You are slightly above healthy range. Moderate calorie deficit with exercise can help.',
            risks: ['High blood pressure', 'Type 2 diabetes risk', 'Joint problems'],
            recommendations: [
                'Create a moderate calorie deficit (300-500 kcal)',
                'Increase physical activity to 5-6 days/week',
                'Focus on whole foods and reduce processed foods',
                'Track portions and avoid late-night eating'
            ]
        };
    } else {
        return {
            category: 'obese',
            label: 'Obese',
            color: '#ef4444', // red
            emoji: '🔴',
            range: '≥ 30',
            advice: 'Consider consulting a doctor. Lifestyle changes with diet control and exercise are important.',
            risks: ['Heart disease', 'Type 2 diabetes', 'Sleep apnea', 'Joint pain'],
            recommendations: [
                'Consult healthcare provider',
                'Start with low-impact exercises like walking',
                'Focus on gradual weight loss (1-2 kg per week)',
                'Consider working with a nutritionist'
            ]
        };
    }
};

/**
 * Calculate ideal weight range based on height
 * @param {number} height - Height in cm
 * @returns {Object} Min and max ideal weight
 */
export const getIdealWeightRange = (height) => {
    const heightInM = height / 100;
    const minIdeal = 18.5 * (heightInM * heightInM);
    const maxIdeal = 24.9 * (heightInM * heightInM);
    
    return {
        min: Math.round(minIdeal * 10) / 10,
        max: Math.round(maxIdeal * 10) / 10
    };
};

/**
 * Calculate weight to lose/gain to reach normal BMI
 * @param {number} weight - Current weight in kg
 * @param {number} height - Height in cm
 * @returns {Object} Weight adjustment needed
 */
export const getWeightAdjustment = (weight, height) => {
    const idealRange = getIdealWeightRange(height);
    const currentBMI = calculateBMI(weight, height);
    
    if (currentBMI < 18.5) {
        // Need to gain
        const targetWeight = idealRange.min;
        return {
            action: 'gain',
            amount: Math.round((targetWeight - weight) * 10) / 10,
            targetWeight,
            message: `You need to gain ${(targetWeight - weight).toFixed(1)} kg to reach healthy range`
        };
    } else if (currentBMI > 24.9) {
        // Need to lose
        const targetWeight = idealRange.max;
        return {
            action: 'lose',
            amount: Math.round((weight - targetWeight) * 10) / 10,
            targetWeight,
            message: `You need to lose ${(weight - targetWeight).toFixed(1)} kg to reach healthy range`
        };
    } else {
        return {
            action: 'maintain',
            amount: 0,
            targetWeight: weight,
            message: 'You are already in healthy weight range'
        };
    }
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR value
 */
export const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE value
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
 * Calculate daily calorie target based on goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - 'fatLoss', 'muscleGain', or 'maintenance'
 * @returns {number} Daily calorie target
 */
export const getCalorieTarget = (tdee, goal) => {
    switch(goal) {
        case 'fatLoss':
            return Math.max(1200, Math.round(tdee - 500));
        case 'muscleGain':
            return Math.round(tdee + 300);
        default:
            return Math.round(tdee);
    }
};

/**
 * Validate health data
 * @param {Object} data - Health data to validate
 * @returns {Object} Validation result
 */
export const validateHealthData = (data) => {
    const errors = [];
    
    if (!data.age || data.age < 13 || data.age > 120) {
        errors.push('Age must be between 13 and 120');
    }
    
    if (!data.height || data.height < 100 || data.height > 250) {
        errors.push('Height must be between 100 and 250 cm');
    }
    
    if (!data.weight || data.weight < 30 || data.weight > 300) {
        errors.push('Weight must be between 30 and 300 kg');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};