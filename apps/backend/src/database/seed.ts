import { db } from './db';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Seed achievements
    const achievements = [
      {
        code: 'first_step',
        name: 'İlk Adım',
        description: 'İlk 10 task\'i tamamladınız',
        icon: '🎯',
        xp_reward: 50,
        category: 'milestone',
      },
      {
        code: 'courage',
        name: 'Cesaret',
        description: 'İlk "A" task\'inizi tamamladınız',
        icon: '🐸',
        xp_reward: 100,
        category: 'milestone',
      },
      {
        code: 'consistency',
        name: 'Tutarlılık',
        description: '3 gün üst üste giriş yaptınız',
        icon: '🔥',
        xp_reward: 75,
        category: 'streak',
      },
      {
        code: 'week_warrior',
        name: 'Hafta Savaşçısı',
        description: '7 gün streak tamamladınız',
        icon: '⚡',
        xp_reward: 150,
        category: 'streak',
      },
      {
        code: 'frog_hunter',
        name: 'Kurbağa Avcısı',
        description: '50 task tamamladınız',
        icon: '🏆',
        xp_reward: 250,
        category: 'milestone',
      },
      {
        code: 'focus_master',
        name: 'Odaklanma Ustası',
        description: 'Focus mode\'da 10 saat geçirdiniz',
        icon: '🎯',
        xp_reward: 200,
        category: 'skill',
      },
    ];

    for (const achievement of achievements) {
      await db.query(
        `INSERT INTO achievements (code, name, description, icon, xp_reward, category)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO NOTHING`,
        [
          achievement.code,
          achievement.name,
          achievement.description,
          achievement.icon,
          achievement.xp_reward,
          achievement.category,
        ]
      );
    }

    console.log('✅ Database seeded successfully!');
    console.log(`   - ${achievements.length} achievements added`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
