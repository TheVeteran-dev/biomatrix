const Medicine = require('../models/Medicine');
const MedicationLog = require('../models/MedicationLog');
const RiskAlert = require('../models/RiskAlert');
const UserProfile = require('../models/UserProfile');

class RiskDetectionService {
  
  // Check for drug interactions
  async checkDrugInteractions() {
    try {
      const activeMedicines = await Medicine.find({ isActive: true });
      const alerts = [];

      // Known drug interactions database (simplified)
      const interactionDatabase = {
        'aspirin': ['warfarin', 'ibuprofen', 'naproxen'],
        'warfarin': ['aspirin', 'vitamin k', 'ibuprofen'],
        'metformin': ['alcohol'],
        'lisinopril': ['potassium supplements', 'spironolactone'],
        'simvastatin': ['gemfibrozil', 'cyclosporine'],
        'levothyroxine': ['calcium', 'iron supplements']
      };

      // Check each medicine against others
      for (let i = 0; i < activeMedicines.length; i++) {
        const med1 = activeMedicines[i];
        const med1Name = med1.name.toLowerCase();

        // Check custom interactions from medicine model
        if (med1.interactsWith && med1.interactsWith.length > 0) {
          for (let j = 0; j < activeMedicines.length; j++) {
            if (i !== j) {
              const med2 = activeMedicines[j];
              const med2Name = med2.name.toLowerCase();

              if (med1.interactsWith.some(name => med2Name.includes(name.toLowerCase()))) {
                alerts.push({
                  type: 'drug_interaction',
                  severity: 'high',
                  title: 'Potential Drug Interaction Detected',
                  description: `${med1.name} may interact with ${med2.name}. This combination may increase side effects or reduce effectiveness.`,
                  medicineIds: [med1._id, med2._id],
                  medicineNames: [med1.name, med2.name],
                  actionRequired: 'Consult your doctor before taking these medicines together.'
                });
              }
            }
          }
        }

        // Check against known interactions database
        if (interactionDatabase[med1Name]) {
          for (let j = 0; j < activeMedicines.length; j++) {
            if (i !== j) {
              const med2 = activeMedicines[j];
              const med2Name = med2.name.toLowerCase();

              const interacts = interactionDatabase[med1Name].some(interactingDrug => 
                med2Name.includes(interactingDrug)
              );

              if (interacts) {
                const existingAlert = alerts.find(alert => 
                  alert.medicineNames.includes(med1.name) && 
                  alert.medicineNames.includes(med2.name)
                );

                if (!existingAlert) {
                  alerts.push({
                    type: 'drug_interaction',
                    severity: 'high',
                    title: 'Known Drug Interaction',
                    description: `${med1.name} and ${med2.name} have a known interaction. Taking them together may cause adverse effects.`,
                    medicineIds: [med1._id, med2._id],
                    medicineNames: [med1.name, med2.name],
                    actionRequired: 'Contact your healthcare provider immediately.'
                  });
                }
              }
            }
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      return [];
    }
  }

  // Check for missed critical medications
  async checkMissedCriticalMeds() {
    try {
      const alerts = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Find critical medicines
      const criticalMedicines = await Medicine.find({ 
        isActive: true, 
        isCritical: true 
      });

      for (const medicine of criticalMedicines) {
        // Check logs from yesterday
        const missedLogs = await MedicationLog.find({
          medicineId: medicine._id,
          scheduledDate: { $gte: yesterday, $lt: today },
          status: 'missed'
        });

        if (missedLogs.length > 0) {
          alerts.push({
            type: 'missed_critical',
            severity: 'critical',
            title: 'Critical Medication Missed',
            description: `You missed ${missedLogs.length} dose(s) of ${medicine.name}, which is marked as critical. Missing this medication may have serious health consequences.`,
            medicineIds: [medicine._id],
            medicineNames: [medicine.name],
            actionRequired: 'Take the missed dose as soon as possible and contact your doctor if needed.'
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking missed critical meds:', error);
      return [];
    }
  }

  // Check for overdose risk
  async checkOverdoseRisk() {
    try {
      const alerts = [];
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const activeMedicines = await Medicine.find({ isActive: true });

      for (const medicine of activeMedicines) {
        // Get today's logs
        const todayLogs = await MedicationLog.find({
          medicineId: medicine._id,
          scheduledDate: { $gte: today, $lt: tomorrow },
          status: 'taken'
        }).sort({ takenAt: -1 });

        if (todayLogs.length > 0) {
          // Check if exceeded max daily doses
          if (medicine.maxDailyDoses && todayLogs.length > medicine.maxDailyDoses) {
            alerts.push({
              type: 'overdose_risk',
              severity: 'critical',
              title: 'Overdose Risk Detected',
              description: `You have taken ${todayLogs.length} doses of ${medicine.name} today, exceeding the maximum of ${medicine.maxDailyDoses} doses per day.`,
              medicineIds: [medicine._id],
              medicineNames: [medicine.name],
              actionRequired: 'Do not take any more doses today. Contact your doctor or poison control immediately if you feel unwell.'
            });
          }

          // Check minimum gap between doses
          if (todayLogs.length >= 2 && medicine.minimumGapHours) {
            const lastDose = new Date(todayLogs[0].takenAt);
            const secondLastDose = new Date(todayLogs[1].takenAt);
            const hoursDifference = (lastDose - secondLastDose) / (1000 * 60 * 60);

            if (hoursDifference < medicine.minimumGapHours) {
              alerts.push({
                type: 'overdose_risk',
                severity: 'high',
                title: 'Doses Taken Too Close Together',
                description: `You took ${medicine.name} only ${hoursDifference.toFixed(1)} hours apart. The minimum recommended gap is ${medicine.minimumGapHours} hours.`,
                medicineIds: [medicine._id],
                medicineNames: [medicine.name],
                actionRequired: 'Wait at least the recommended time before taking the next dose.'
              });
            }
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking overdose risk:', error);
      return [];
    }
  }

  // Check for low adherence
  async checkLowAdherence() {
    try {
      const alerts = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const activeMedicines = await Medicine.find({ isActive: true });

      for (const medicine of activeMedicines) {
        const weekLogs = await MedicationLog.find({
          medicineId: medicine._id,
          scheduledDate: { $gte: weekAgo, $lt: today }
        });

        const takenLogs = weekLogs.filter(log => log.status === 'taken');
        const adherence = weekLogs.length > 0 
          ? (takenLogs.length / weekLogs.length) * 100 
          : 100;

        // Alert if adherence below 70%
        if (adherence < 70 && weekLogs.length > 0) {
          const severity = adherence < 50 ? 'high' : 'medium';
          
          alerts.push({
            type: 'low_adherence',
            severity: severity,
            title: 'Low Medication Adherence',
            description: `Your adherence for ${medicine.name} is ${adherence.toFixed(1)}% over the past week. Consistent medication intake is important for treatment effectiveness.`,
            medicineIds: [medicine._id],
            medicineNames: [medicine.name],
            actionRequired: 'Try setting reminders or using the Biomatrix app regularly to improve adherence.'
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking low adherence:', error);
      return [];
    }
  }

  // Check contraindications based on user profile
  async checkContraindications() {
    try {
      const alerts = [];
      const userProfile = await UserProfile.findOne();
      
      if (!userProfile) return alerts;

      const activeMedicines = await Medicine.find({ isActive: true });

      // Known contraindications database
      const contraindicationDatabase = {
        'aspirin': ['pregnancy', 'breastfeeding', 'asthma'],
        'ibuprofen': ['pregnancy', 'kidney_disease', 'heart_disease'],
        'metformin': ['kidney_disease', 'liver_disease'],
        'lisinopril': ['pregnancy'],
        'warfarin': ['pregnancy', 'liver_disease']
      };

      for (const medicine of activeMedicines) {
        const medName = medicine.name.toLowerCase();

        // Check custom contraindications from medicine model
        if (medicine.contraindications && medicine.contraindications.length > 0) {
          const matchingConditions = userProfile.medicalConditions.filter(condition =>
            medicine.contraindications.some(contra => 
              condition.toLowerCase().includes(contra.toLowerCase())
            )
          );

          if (matchingConditions.length > 0) {
            alerts.push({
              type: 'contraindication',
              severity: 'critical',
              title: 'Contraindication Alert',
              description: `${medicine.name} is contraindicated for your condition(s): ${matchingConditions.join(', ')}. This medicine may be dangerous for you.`,
              medicineIds: [medicine._id],
              medicineNames: [medicine.name],
              actionRequired: 'Stop taking this medicine and contact your doctor immediately.'
            });
          }
        }

        // Check against known contraindications
        if (contraindicationDatabase[medName]) {
          const matchingConditions = userProfile.medicalConditions.filter(condition =>
            contraindicationDatabase[medName].includes(condition)
          );

          if (matchingConditions.length > 0) {
            alerts.push({
              type: 'contraindication',
              severity: 'critical',
              title: 'Known Contraindication',
              description: `${medicine.name} may not be safe for people with ${matchingConditions.join(', ')}. This is a known contraindication.`,
              medicineIds: [medicine._id],
              medicineNames: [medicine.name],
              actionRequired: 'Consult your healthcare provider about this medicine.'
            });
          }
        }

        // Check allergies
        if (userProfile.allergies && userProfile.allergies.length > 0) {
          const isAllergic = userProfile.allergies.some(allergy =>
            medName.includes(allergy.toLowerCase()) ||
            allergy.toLowerCase().includes(medName)
          );

          if (isAllergic) {
            alerts.push({
              type: 'allergy_warning',
              severity: 'critical',
              title: 'Allergy Alert',
              description: `You are marked as allergic to ${medicine.name}. Taking this medicine may cause an allergic reaction.`,
              medicineIds: [medicine._id],
              medicineNames: [medicine.name],
              actionRequired: 'DO NOT take this medicine. Contact your doctor immediately.'
            });
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking contraindications:', error);
      return [];
    }
  }

  // Run all checks and save alerts
  async runAllChecks() {
    try {
      const allAlerts = [];

      // Run all detection methods
      const interactions = await this.checkDrugInteractions();
      const missedCritical = await this.checkMissedCriticalMeds();
      const overdose = await this.checkOverdoseRisk();
      const lowAdherence = await this.checkLowAdherence();
      const contraindications = await this.checkContraindications();

      allAlerts.push(...interactions, ...missedCritical, ...overdose, ...lowAdherence, ...contraindications);

      // Save alerts to database
      for (const alert of allAlerts) {
        // Check if similar alert already exists and is active
        const existing = await RiskAlert.findOne({
          type: alert.type,
          medicineNames: { $all: alert.medicineNames },
          isActive: true,
          isDismissed: false
        });

        if (!existing) {
          await RiskAlert.create(alert);
        }
      }

      return allAlerts;
    } catch (error) {
      console.error('Error running all checks:', error);
      return [];
    }
  }
}

module.exports = new RiskDetectionService();