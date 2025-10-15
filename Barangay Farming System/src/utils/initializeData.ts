import { 
  cropsApi, 
  harvestsApi, 
  budgetApi, 
  volunteersApi, 
  tasksApi, 
  pollsApi, 
  feedbacksApi, 
  photosApi, 
  updatesApi, 
  eventsApi 
} from './api';

export async function initializeDatabaseWithSampleData() {
  try {
    // Check if data already exists
    const existingCrops = await cropsApi.getAll();
    if (existingCrops && existingCrops.length > 0) {
      console.log('Database already initialized');
      return false;
    }

    console.log('Initializing database with sample data...');

    // Initialize Crops
    const sampleCrops = [
      {
        name: "Tomatoes",
        variety: "Cherry",
        plotNumber: "A1",
        datePlanted: "2025-09-15",
        estimatedHarvest: "2025-10-30",
        status: "ready",
        quantity: "50 plants",
        health: "healthy"
      },
      {
        name: "Eggplant",
        variety: "Black Beauty",
        plotNumber: "A2",
        datePlanted: "2025-09-20",
        estimatedHarvest: "2025-11-05",
        status: "growing",
        quantity: "40 plants",
        health: "needs-water"
      },
      {
        name: "String Beans",
        variety: "Sitao",
        plotNumber: "B1",
        datePlanted: "2025-09-10",
        estimatedHarvest: "2025-10-25",
        status: "ready",
        quantity: "60 plants",
        health: "healthy"
      },
      {
        name: "Lettuce",
        variety: "Iceberg",
        plotNumber: "B2",
        datePlanted: "2025-09-25",
        estimatedHarvest: "2025-11-10",
        status: "growing",
        quantity: "80 plants",
        health: "healthy"
      },
      {
        name: "Pechay",
        variety: "Native",
        plotNumber: "C1",
        datePlanted: "2025-08-20",
        estimatedHarvest: "2025-10-05",
        status: "harvested",
        quantity: "100 plants",
        health: "healthy"
      },
      {
        name: "Cabbage",
        variety: "Green",
        plotNumber: "C2",
        datePlanted: "2025-09-18",
        estimatedHarvest: "2025-11-15",
        status: "growing",
        quantity: "35 plants",
        health: "pest-issue"
      }
    ];

    for (const crop of sampleCrops) {
      await cropsApi.create(crop);
    }

    // Initialize Harvests
    const sampleHarvests = [
      {
        cropName: "Pechay (Native)",
        harvestDate: "2025-10-05",
        quantity: "45 kg",
        distributionMethod: "Community distribution",
        notes: "Distributed to 30 families"
      },
      {
        cropName: "Okra",
        harvestDate: "2025-09-28",
        quantity: "25 kg",
        distributionMethod: "Sold at barangay market",
        notes: "Proceeds used for garden maintenance"
      },
      {
        cropName: "Ampalaya",
        harvestDate: "2025-09-15",
        quantity: "30 kg",
        distributionMethod: "Senior citizens program",
        notes: "Special distribution for elderly residents"
      },
      {
        cropName: "Kangkong",
        harvestDate: "2025-09-10",
        quantity: "20 kg",
        distributionMethod: "Community distribution",
        notes: "Distributed to 15 families"
      }
    ];

    for (const harvest of sampleHarvests) {
      await harvestsApi.create(harvest);
    }

    // Initialize Budget Items
    const sampleBudget = [
      {
        category: "Seeds",
        description: "Tomato and eggplant seeds",
        amount: 2500,
        date: "2025-09-01"
      },
      {
        category: "Tools",
        description: "Garden tools (shovels, rakes)",
        amount: 3500,
        date: "2025-09-05"
      },
      {
        category: "Fertilizer",
        description: "Organic fertilizer and compost",
        amount: 4000,
        date: "2025-09-10"
      },
      {
        category: "Water",
        description: "Water system maintenance",
        amount: 1500,
        date: "2025-09-15"
      },
      {
        category: "Seeds",
        description: "Lettuce and pechay seeds",
        amount: 1800,
        date: "2025-09-20"
      },
      {
        category: "Maintenance",
        description: "Plot preparation and weeding",
        amount: 2200,
        date: "2025-09-25"
      },
      {
        category: "Tools",
        description: "Watering cans and hoses",
        amount: 1200,
        date: "2025-09-28"
      }
    ];

    for (const item of sampleBudget) {
      await budgetApi.create(item);
    }

    // Initialize Volunteers
    const sampleVolunteers = [
      {
        name: "Maria Santos",
        hoursContributed: 48,
        tasksCompleted: 12,
        lastActivity: "2025-10-08",
        role: "Lead Gardener"
      },
      {
        name: "Juan Dela Cruz",
        hoursContributed: 36,
        tasksCompleted: 9,
        lastActivity: "2025-10-07",
        role: "Irrigation Specialist"
      },
      {
        name: "Ana Reyes",
        hoursContributed: 42,
        tasksCompleted: 11,
        lastActivity: "2025-10-09",
        role: "Volunteer Coordinator"
      },
      {
        name: "Pedro Garcia",
        hoursContributed: 28,
        tasksCompleted: 7,
        lastActivity: "2025-10-06",
        role: "Volunteer"
      },
      {
        name: "Rosa Martinez",
        hoursContributed: 32,
        tasksCompleted: 8,
        lastActivity: "2025-10-08",
        role: "Volunteer"
      }
    ];

    for (const volunteer of sampleVolunteers) {
      await volunteersApi.create(volunteer);
    }

    // Initialize Tasks
    const sampleTasks = [
      {
        title: "Water Plot A1 and A2",
        assignedTo: "Juan Dela Cruz",
        dueDate: "2025-10-11",
        status: "in-progress",
        priority: "high"
      },
      {
        title: "Weed Plot B1",
        assignedTo: "Maria Santos",
        dueDate: "2025-10-12",
        status: "pending",
        priority: "medium"
      },
      {
        title: "Harvest tomatoes from Plot A1",
        assignedTo: "Ana Reyes",
        dueDate: "2025-10-30",
        status: "pending",
        priority: "high"
      },
      {
        title: "Apply fertilizer to Plot C",
        assignedTo: "Pedro Garcia",
        dueDate: "2025-10-15",
        status: "completed",
        priority: "medium"
      },
      {
        title: "Inspect crops for pests",
        assignedTo: "Rosa Martinez",
        dueDate: "2025-10-13",
        status: "in-progress",
        priority: "high"
      }
    ];

    for (const task of sampleTasks) {
      await tasksApi.create(task);
    }

    // Initialize Polls
    await pollsApi.create({
      question: "What should we plant in Plot D next month?",
      options: [
        { id: "opt1", text: "Carrots", votes: 15 },
        { id: "opt2", text: "Radish", votes: 8 },
        { id: "opt3", text: "Bell Peppers", votes: 22 },
        { id: "opt4", text: "Cucumber", votes: 12 }
      ],
      totalVotes: 57,
      endsAt: "2025-10-20"
    });

    // Initialize Feedbacks
    const sampleFeedbacks = [
      {
        name: "Liza Morales",
        message: "Thank you for the fresh vegetables! My family really enjoyed the pechay. Looking forward to more harvests!",
        category: "appreciation",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        name: "Roberto Cruz",
        message: "Suggestion: Can we have a composting workshop? I think it would help us recycle waste and improve soil quality.",
        category: "suggestion",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        name: "Carmen Villanueva",
        message: "The garden is looking great! Proud to be part of this community initiative.",
        category: "appreciation",
        date: new Date().toISOString() // today
      }
    ];

    for (const feedback of sampleFeedbacks) {
      await feedbacksApi.create(feedback);
    }

    // Initialize Photos
    const samplePhotos = [
      {
        url: "https://images.unsplash.com/photo-1689666190477-259395cd4f21?w=800&q=80",
        title: "Harvest Day Celebration",
        description: "Community members gathering fresh vegetables",
        date: "2025-10-05",
        category: "harvest"
      },
      {
        url: "https://images.unsplash.com/photo-1729589985474-7df55c987ea8?w=800&q=80",
        title: "Community Planting Event",
        description: "Volunteers planting new crops together",
        date: "2025-09-20",
        category: "event"
      },
      {
        url: "https://images.unsplash.com/photo-1627831391145-b25c7f06947d?w=800&q=80",
        title: "New Plot Preparation",
        description: "Preparing soil for the next planting season",
        date: "2025-09-15",
        category: "planting"
      },
      {
        url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
        title: "Garden Progress",
        description: "Thriving crops in Plot A",
        date: "2025-09-28",
        category: "progress"
      },
      {
        url: "https://images.unsplash.com/photo-1592419391068-9bd09dd58510?w=800&q=80",
        title: "Fresh Tomatoes",
        description: "Cherry tomatoes ready for harvest",
        date: "2025-10-01",
        category: "progress"
      },
      {
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
        title: "Community Workshop",
        description: "Learning organic farming techniques",
        date: "2025-09-22",
        category: "event"
      }
    ];

    for (const photo of samplePhotos) {
      await photosApi.create(photo);
    }

    // Initialize Updates
    const sampleUpdates = [
      {
        title: "Harvest Day Success!",
        message: "Successfully harvested 45kg of pechay and distributed to 30 families in the community.",
        type: "success"
      },
      {
        title: "Community Planting Day",
        message: "Join us this Saturday at 7AM for our community planting day. We'll be planting lettuce and carrots!",
        type: "event"
      },
      {
        title: "Water System Maintenance",
        message: "The irrigation system will undergo maintenance on October 12. Please water your plots manually if needed.",
        type: "warning"
      },
      {
        title: "New Budget Allocation",
        message: "Additional ₱10,000 has been allocated for the next quarter from barangay funds.",
        type: "info"
      }
    ];

    for (const update of sampleUpdates) {
      await updatesApi.create(update);
    }

    // Initialize Events
    const sampleEvents = [
      {
        date: "2025-10-12",
        title: "Community Planting Day",
        type: "planting",
        description: "Plant lettuce and carrots in Plot C2"
      },
      {
        date: "2025-10-25",
        title: "String Beans Harvest",
        type: "harvest",
        description: "Harvest string beans from Plot B1"
      },
      {
        date: "2025-10-30",
        title: "Tomato Harvest",
        type: "harvest",
        description: "Harvest cherry tomatoes from Plot A1"
      },
      {
        date: "2025-10-15",
        title: "Garden Maintenance",
        type: "maintenance",
        description: "Weeding and fertilizer application"
      },
      {
        date: "2025-10-20",
        title: "Community Garden Meeting",
        type: "event",
        description: "Monthly meeting to discuss garden progress and plans"
      }
    ];

    for (const event of sampleEvents) {
      await eventsApi.create(event);
    }

    console.log('Sample data initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
}
