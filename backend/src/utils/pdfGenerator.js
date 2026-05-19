import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * PDF Generator for Diet Plans
 * Creates professional PDF documents with user info and diet plans
 */

/**
 * Generate diet plan PDF
 * @param {Object} data - PDF data including user, profile, and plan
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateDietPDF = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `NutriPlan AI - ${data.user.name}'s Diet Plan`,
                    Author: 'NutriPlan AI',
                    Subject: 'Personalized Diet Plan',
                    Keywords: 'diet, nutrition, health, AI',
                    CreationDate: new Date()
                }
            });
            
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // Add content
            addHeader(doc, data);
            addUserInfo(doc, data);
            addDietPlan(doc, data);
            addHealthTips(doc, data);
            addFooter(doc);
            
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Add PDF header
 */
const addHeader = (doc, data) => {
    // Logo and Title
    doc.fontSize(28)
        .fillColor('#22c55e')
        .font('Helvetica-Bold')
        .text('NutriPlan AI', { align: 'center' })
        .moveDown(0.5);
    
    doc.fontSize(16)
        .fillColor('#4b5563')
        .font('Helvetica')
        .text('AI-Powered Personalized Diet Plan', { align: 'center' })
        .moveDown(1);
    
    // Date
    doc.fontSize(10)
        .fillColor('#6b7280')
        .text(`Generated on: ${new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, { align: 'right' })
        .moveDown(1);
    
    // Divider
    doc.strokeColor('#22c55e')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1);
};

/**
 * Add user information section
 */
const addUserInfo = (doc, data) => {
    const { user, profile } = data;
    
    doc.fontSize(16)
        .fillColor('#22c55e')
        .font('Helvetica-Bold')
        .text('👤 User Information', { continued: false })
        .moveDown(0.5);
    
    // Create table for user info
    const userInfoY = doc.y;
    
    doc.fontSize(11)
        .fillColor('#1f2937')
        .font('Helvetica');
    
    // Left column
    doc.text(`Name:`, 50, userInfoY)
        .text(`Age:`, 50, userInfoY + 20)
        .text(`Gender:`, 50, userInfoY + 40)
        .text(`Height:`, 50, userInfoY + 60);
    
    doc.font('Helvetica-Bold');
    doc.text(user.name, 150, userInfoY)
        .text(`${profile.age} years`, 150, userInfoY + 20)
        .text(profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1), 150, userInfoY + 40)
        .text(`${profile.height} cm`, 150, userInfoY + 60);
    
    // Right column
    doc.font('Helvetica');
    doc.text(`Weight:`, 300, userInfoY)
        .text(`BMI:`, 300, userInfoY + 20)
        .text(`Category:`, 300, userInfoY + 40)
        .text(`Goal:`, 300, userInfoY + 60);
    
    doc.font('Helvetica-Bold');
    doc.text(`${profile.weight} kg`, 380, userInfoY)
        .text(profile.bmi, 380, userInfoY + 20)
        .text(profile.bmiCategory.charAt(0).toUpperCase() + profile.bmiCategory.slice(1), 380, userInfoY + 40)
        .text(profile.goal.replace(/([A-Z])/g, ' $1').trim(), 380, userInfoY + 60);
    
    doc.moveDown(5);
};

/**
 * Add diet plan section
 */
const addDietPlan = (doc, data) => {
    const { plan } = data;
    
    doc.fontSize(16)
        .fillColor('#22c55e')
        .font('Helvetica-Bold')
        .text('🍽️ 7-Day Diet Plan', { continued: false })
        .moveDown(0.5);
    
    // Daily calorie target
    doc.fontSize(12)
        .fillColor('#4b5563')
        .text(`Daily Calorie Target: ${plan.dailyCalorieTarget} kcal`, { align: 'center' })
        .moveDown(1);
    
    // Create table for diet plan
    const tableTop = doc.y;
    const tableHeaders = ['Day', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Total'];
    const columnWidths = [60, 100, 100, 100, 80, 50];
    let currentY = tableTop;
    
    // Draw table header
    doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#ffffff');
    
    let currentX = 50;
    tableHeaders.forEach((header, index) => {
        doc.rect(currentX - 2, currentY - 5, columnWidths[index] + 4, 20)
            .fill('#22c55e');
        doc.fillColor('#ffffff')
            .text(header, currentX, currentY, { width: columnWidths[index], align: 'left' });
        currentX += columnWidths[index];
    });
    
    currentY += 20;
    
    // Draw table rows
    doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#1f2937');
    
    plan.days.forEach((day, index) => {
        const rowY = currentY + (index * 25);
        
        // Alternate row background
        if (index % 2 === 0) {
            doc.rect(48, rowY - 5, 502, 25)
                .fill('#f9fafb');
        }
        
        doc.fillColor('#1f2937');
        
        // Day
        doc.text(day.day.substring(0, 3), 50, rowY, { width: columnWidths[0] });
        
        // Breakfast
        doc.text(`${day.breakfast.name.substring(0, 15)}...`, 50 + columnWidths[0], rowY, { width: columnWidths[1] });
        
        // Lunch
        doc.text(`${day.lunch.name.substring(0, 15)}...`, 50 + columnWidths[0] + columnWidths[1], rowY, { width: columnWidths[2] });
        
        // Dinner
        doc.text(`${day.dinner.name.substring(0, 15)}...`, 50 + columnWidths[0] + columnWidths[1] + columnWidths[2], rowY, { width: columnWidths[3] });
        
        // Snacks
        doc.text(`${day.snacks.name.substring(0, 10)}...`, 50 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], rowY, { width: columnWidths[4] });
        
        // Total
        doc.text(`${day.totalCalories}`, 50 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4], rowY, { width: columnWidths[5] });
    });
    
    doc.moveDown(plan.days.length + 2);
};

/**
 * Add health tips section
 */
const addHealthTips = (doc, data) => {
    const { plan } = data;
    
    if (!plan.healthTips || plan.healthTips.length === 0) return;
    
    doc.fontSize(16)
        .fillColor('#22c55e')
        .font('Helvetica-Bold')
        .text('💡 Health Tips', { continued: false })
        .moveDown(0.5);
    
    doc.fontSize(10)
        .fillColor('#1f2937')
        .font('Helvetica');
    
    plan.healthTips.forEach((tip, index) => {
        doc.text(`${index + 1}. ${tip}`, {
            indent: 20,
            continued: false
        }).moveDown(0.3);
    });
    
    doc.moveDown(1);
};

/**
 * Add footer
 */
const addFooter = (doc) => {
    const pages = doc.bufferedPageRange();
    
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        // Footer line
        doc.strokeColor('#22c55e')
            .lineWidth(1)
            .moveTo(50, doc.page.height - 50)
            .lineTo(550, doc.page.height - 50)
            .stroke();
        
        // Footer text
        doc.fontSize(8)
            .fillColor('#9ca3af')
            .font('Helvetica')
            .text(
                'Generated by NutriPlan AI - Your Personal AI Nutritionist',
                50,
                doc.page.height - 40,
                { align: 'center', width: 500 }
            );
        
        // Page number
        doc.text(
            `Page ${i + 1} of ${pages.count}`,
            50,
            doc.page.height - 30,
            { align: 'center', width: 500 }
        );
    }
};

/**
 * Generate CSV export of diet plans
 * @param {Array} plans - Array of diet plans
 * @returns {string} CSV content
 */
export const generateCSV = (plans) => {
    const headers = ['Date', 'Day', 'Breakfast', 'Breakfast Calories', 'Lunch', 'Lunch Calories', 'Dinner', 'Dinner Calories', 'Snacks', 'Snacks Calories', 'Total Calories', 'Goal'];
    
    const rows = plans.flatMap(plan => 
        plan.days.map(day => [
            new Date(plan.createdAt).toLocaleDateString(),
            day.day,
            day.breakfast.name,
            day.breakfast.calories,
            day.lunch.name,
            day.lunch.calories,
            day.dinner.name,
            day.dinner.calories,
            day.snacks.name,
            day.snacks.calories,
            day.totalCalories,
            plan.goal
        ])
    );
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
};

/**
 * Generate BMI report PDF
 * @param {Object} data - BMI data
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateBMIReport = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });
            
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // Add header
            doc.fontSize(24)
                .fillColor('#22c55e')
                .text('BMI Report', { align: 'center' })
                .moveDown();
            
            // Add BMI info
            doc.fontSize(14)
                .fillColor('#1f2937')
                .text(`Current BMI: ${data.currentBMI}`)
                .text(`Category: ${data.category}`)
                .text(`Ideal Weight Range: ${data.idealWeight.min} - ${data.idealWeight.max} kg`)
                .moveDown();
            
            // Add recommendations
            doc.fontSize(16)
                .fillColor('#22c55e')
                .text('Recommendations')
                .moveDown(0.5);
            
            data.recommendations.forEach(rec => {
                doc.fontSize(11)
                    .fillColor('#1f2937')
                    .text(`• ${rec}`);
            });
            
            doc.end();
            resolve(Buffer.concat(chunks));
        } catch (error) {
            reject(error);
        }
    });
};