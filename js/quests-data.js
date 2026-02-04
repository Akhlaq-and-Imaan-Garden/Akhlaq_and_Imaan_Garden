// All 30 Days of Ramadan Quests Data
const questsData = [
    {
        day: 1,
        title: "Welcome Ramadan! 🌙",
        category: "Faith & Worship",
        description: "Our special guest Ramadan is here! For 30 days, we'll go on amazing quests together.",
        quest: "Spot the crescent moon tonight with your family!",
        howToComplete: "Go outside after sunset and look for the beautiful crescent moon. Take a picture if you can!",
        parentTip: "Make moon spotting a family event! Use binoculars if available and explain the Islamic lunar calendar.",
        points: 10,
        emoji: "🌙",
        week: 1
    },
    {
        day: 2,
        title: "The Story of How Ramadan Came 📖",
        category: "Faith & Worship",
        description: "Did you know Ramadan is when the Quran was revealed? Learn this beautiful story!",
        quest: "Tell one person why we fast in Ramadan",
        howToComplete: "After learning the story with your parents, share it with a family member or friend.",
        parentTip: "Use story time before bed to explain when fasting was ordained and why Ramadan is special.",
        points: 10,
        emoji: "📖",
        week: 1
    },
    {
        day: 3,
        title: "Stars of Good Deeds ⭐",
        category: "Creative Activities",
        description: "Ramadan has 6 special stars! Each star represents a blessing of this month.",
        quest: "Create your own Ramadan stars chart!",
        howToComplete: "Download the craft template from Resources, color the 6 stars (Quran revealed, Laylatul Qadr, Forgiveness, Doors of Jannah open, Victory of Badr, Unity), and stick them on your crescent moon!",
        parentTip: "Help your child understand each blessing as they color. This is a great learning activity!",
        points: 10,
        emoji: "⭐",
        week: 1
    },
    {
        day: 4,
        title: "Little Quran Champion 📕",
        category: "Quran Learning",
        description: "Ramadan is the month of the Quran! Let's be Quran Champions!",
        quest: "Read or listen to 1 short Surah today",
        howToComplete: "Choose from Al-Fatiha, Al-Ikhlas, Al-Falaq, or An-Nas. Listen to the recitation and try to repeat it!",
        parentTip: "Help your child choose a surah. Listen together and explain the meaning in simple words.",
        points: 10,
        emoji: "📕",
        week: 1
    },
    {
        day: 5,
        title: "Kindness Quest ❤️",
        category: "Good Deeds & Character",
        description: "Ramadan teaches us to be kind to everyone!",
        quest: "Complete 3 acts of kindness today!",
        howToComplete: "Choose from: help with dishes, share toys, smile at everyone, give a hug, or thank Allah for something.",
        parentTip: "Capture these beautiful moments! Encourage kindness without expecting anything in return.",
        points: 10,
        emoji: "❤️",
        week: 1
    },
    {
        day: 6,
        title: "Dua Power 🤲",
        category: "Faith & Worship",
        description: "Your duas are super special in Ramadan! Allah loves to hear from you!",
        quest: "Learn 1 new dua today!",
        howToComplete: "Choose a dua (before eating, after eating, morning/evening, or for parents). Practice saying it correctly!",
        parentTip: "Practice makes perfect! Say the dua together throughout the day until your child memorizes it.",
        points: 10,
        emoji: "🤲",
        week: 1
    },
    {
        day: 7,
        title: "Family Iftar Night 🍽️",
        category: "Family Bonding",
        description: "Gathering for Iftar is one of the most special parts of Ramadan!",
        quest: "Help prepare Iftar today - even small helpers count!",
        howToComplete: "Set the table, arrange dates, pour water, or help with any small task. Every little bit helps!",
        parentTip: "Give age-appropriate tasks. Celebrate their contribution to the family meal!",
        points: 10,
        emoji: "🍽️",
        week: 1
    },
    {
        day: 8,
        title: "Salah Champion 🕌",
        category: "Faith & Worship",
        description: "Prayer is our direct line to Allah! Let's pray together!",
        quest: "Pray at least one Salah with your family today",
        howToComplete: "Choose any prayer (Fajr, Dhuhr, Asr, Maghrib, or Isha) and pray together as a family.",
        parentTip: "Make prayer time special with a colorful prayer mat. Pray together and explain each movement.",
        points: 10,
        emoji: "🕌",
        week: 2
    },
    {
        day: 9,
        title: "Patience Practice 😊",
        category: "Good Deeds & Character",
        description: "Fasting teaches us patience (Sabr). You can do it!",
        quest: "When you feel angry or upset today, take 3 deep breaths!",
        howToComplete: "Practice the 3-breath technique: Breathe in slowly, hold for 2 seconds, breathe out slowly. Repeat 3 times!",
        parentTip: "Model patience yourself. Praise your child when they show patience in difficult situations.",
        points: 10,
        emoji: "😊",
        week: 2
    },
    {
        day: 10,
        title: "Sharing is Caring 🎁",
        category: "Good Deeds & Character",
        description: "In Ramadan, giving charity (Sadaqah) is extra special!",
        quest: "Share something with someone who needs it",
        howToComplete: "Share snacks, donate old toys, or help someone in need. Even a smile is charity!",
        parentTip: "Visit a charity together or help your child choose toys to donate. Explain the concept of Sadaqah.",
        points: 10,
        emoji: "🎁",
        week: 2
    },
    {
        day: 11,
        title: "Dhikr Time 📿",
        category: "Faith & Worship",
        description: "Remembering Allah is easy and brings HUGE rewards!",
        quest: "Say 'SubhanAllah' 10 times today",
        howToComplete: "Say 'SubhanAllah' (Glory be to Allah) 10 times. You can use your fingers to count!",
        parentTip: "Make Dhikr fun! Count together and explain that SubhanAllah means praising Allah's perfection.",
        points: 10,
        emoji: "📿",
        week: 2
    },
    {
        day: 12,
        title: "Night of Power Prep 🌟",
        category: "Faith & Worship",
        description: "There's a special night in Ramadan worth 1000 months! That's 83 years!",
        quest: "Learn about Laylatul Qadr with your parents",
        howToComplete: "Ask your parents about Laylatul Qadr - when it is, why it's special, and what we should do on that night.",
        parentTip: "Explain that Laylatul Qadr is in the last 10 nights, likely on odd nights (21, 23, 25, 27, 29).",
        points: 10,
        emoji: "🌟",
        week: 2
    },
    {
        day: 13,
        title: "Grateful Heart ❤️",
        category: "Good Deeds & Character",
        description: "Alhamdulillah for everything! Let's count our blessings!",
        quest: "List 5 things you're grateful for today",
        howToComplete: "Write or draw 5 things you're thankful for. Start with: I'm grateful for...",
        parentTip: "Download the Gratitude Journal from Resources. This is a beautiful daily practice!",
        points: 10,
        emoji: "❤️",
        week: 2
    },
    {
        day: 14,
        title: "Halfway Celebration! 🎉",
        category: "Family Bonding",
        description: "You're doing AMAZING! We've completed 14 quests together!",
        quest: "Celebrate by reading Quran together as a family",
        howToComplete: "Gather the family and read any amount of Quran together. Celebrate how far you've come!",
        parentTip: "Review your child's progress so far. Praise their efforts and encourage them for the second half!",
        points: 10,
        emoji: "🎉",
        week: 2
    },
    {
        day: 15,
        title: "Honesty Hero 🦸",
        category: "Good Deeds & Character",
        description: "Prophet Muhammad ﷺ was called 'The Trustworthy' (Al-Amin)!",
        quest: "Practice honesty all day - even when it's hard!",
        howToComplete: "Be truthful in everything you say and do today. Being honest makes you a hero!",
        parentTip: "Share stories of Prophet Muhammad's ﷺ honesty. Create a safe space for truth-telling.",
        points: 10,
        emoji: "🦸",
        week: 3
    },
    {
        day: 16,
        title: "Respect Quest 🙏",
        category: "Good Deeds & Character",
        description: "Islam teaches us to respect everyone, especially our parents!",
        quest: "Say something nice to your parents today",
        howToComplete: "Tell your parents something you love about them. Say 'JazakAllah Khair' (May Allah reward you) for all they do!",
        parentTip: "Accept their kind words graciously and reciprocate. Model respectful behavior.",
        points: 10,
        emoji: "🙏",
        week: 3
    },
    {
        day: 17,
        title: "Clean & Tidy 🧹",
        category: "Good Deeds & Character",
        description: "Cleanliness is half of faith! Let's keep our spaces beautiful!",
        quest: "Clean your room and keep your prayer mat tidy",
        howToComplete: "Organize your room, put away toys, and make sure your prayer space is clean and ready.",
        parentTip: "Take before & after photos! Cleanliness in Islam extends to our environment.",
        points: 10,
        emoji: "🧹",
        week: 3
    },
    {
        day: 18,
        title: "Forgiveness Day 💚",
        category: "Good Deeds & Character",
        description: "In Ramadan, we ask Allah to forgive us. We should forgive others too!",
        quest: "Forgive someone today or say sorry if you need to",
        howToComplete: "If you're upset with someone, forgive them! If you made a mistake, be brave and say sorry!",
        parentTip: "Role-play forgiveness scenarios. Explain that forgiving others helps our own hearts feel lighter.",
        points: 10,
        emoji: "💚",
        week: 3
    },
    {
        day: 19,
        title: "Helping Hands 🤝",
        category: "Good Deeds & Character",
        description: "Little helpers make a BIG difference!",
        quest: "Help with 3 household tasks today!",
        howToComplete: "Complete 3 chores: help with dishes, fold laundry, tidy up, or assist siblings!",
        parentTip: "Give specific, age-appropriate tasks. Take photos of your little helper in action!",
        points: 10,
        emoji: "🤝",
        week: 3
    },
    {
        day: 20,
        title: "Silent Charity 🤫",
        category: "Good Deeds & Character",
        description: "Sometimes the best good deeds are done in secret!",
        quest: "Do one good deed without telling anyone (except Allah!)",
        howToComplete: "Do something nice secretly - only you and Allah will know! That makes it extra special!",
        parentTip: "Explain that the best charity is often done without showing off. Allah sees everything!",
        points: 10,
        emoji: "🤫",
        week: 3
    },
    {
        day: 21,
        title: "Last 10 Nights Begin! ⭐",
        category: "Faith & Worship",
        description: "The Golden Nights are here! These are the most blessed nights of the year!",
        quest: "Stay up a little later for extra worship tonight!",
        howToComplete: "Stay awake for Isha prayer and make dua together with your family!",
        parentTip: "These final nights are precious. Help your child participate in Taraweeh or family worship.",
        points: 10,
        emoji: "⭐",
        week: 3
    },
    {
        day: 22,
        title: "Dua List Night 📝",
        category: "Faith & Worship",
        description: "Laylatul Qadr is coming! Let's prepare our special duas!",
        quest: "Write down your duas for Laylatul Qadr",
        howToComplete: "Download the Dua List template and write what you want to ask Allah for!",
        parentTip: "Help your child think about meaningful duas: family, health, Jannah, forgiveness, etc.",
        points: 10,
        emoji: "📝",
        week: 4
    },
    {
        day: 23,
        title: "Odd Night Watch 🌙",
        category: "Faith & Worship",
        description: "Tonight is an odd night! It could be Laylatul Qadr!",
        quest: "Say the special Laylatul Qadr dua tonight",
        howToComplete: "Learn and say: 'Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni' (O Allah, You are Forgiving and love forgiveness, so forgive me)",
        parentTip: "Practice this dua together many times. Break it down into small parts for easier memorization.",
        points: 10,
        emoji: "🌙",
        week: 4
    },
    {
        day: 24,
        title: "Worship Marathon 🏃",
        category: "Faith & Worship",
        description: "Today's quest: Do as many good deeds as possible!",
        quest: "Complete as many worship acts as you can today!",
        howToComplete: "Check off: Read Quran ✓ Make Dhikr ✓ Give Sadaqah ✓ Pray Salah ✓ Make Dua ✓",
        parentTip: "Download the Worship Checklist from Resources. Make it a fun family challenge!",
        points: 10,
        emoji: "🏃",
        week: 4
    },
    {
        day: 25,
        title: "Odd Night #2 ⭐",
        category: "Faith & Worship",
        description: "Another golden chance! Tonight is the 25th night!",
        quest: "Stay awake for Tahajjud (night prayer) with family",
        howToComplete: "Set your alarm! Wake up before Fajr and pray Tahajjud together!",
        parentTip: "Even 10 minutes is valuable. Help your child experience the peace of pre-dawn prayer.",
        points: 10,
        emoji: "⭐",
        week: 4
    },
    {
        day: 26,
        title: "Community Connection 🌍",
        category: "Faith & Worship",
        description: "Muslims around the world are fasting with you!",
        quest: "Learn about how Ramadan is celebrated in a different country",
        howToComplete: "Research with your parents how kids in another country celebrate Ramadan!",
        parentTip: "Watch videos or read books about Ramadan traditions worldwide. We're one global Ummah!",
        points: 10,
        emoji: "🌍",
        week: 4
    },
    {
        day: 27,
        title: "THE BIG NIGHT! 🌟⭐🌙",
        category: "Faith & Worship",
        description: "Many scholars say tonight is most likely LAYLATUL QADR! This night is worth 83 YEARS!",
        quest: "Do EVERY good deed you can tonight!",
        howToComplete: "Pray, make dua, read Quran, give charity - DO IT ALL! Make this night count!",
        parentTip: "Stay up as much as possible. This is THE night! Make it memorable for your child.",
        points: 10,
        emoji: "🌟",
        week: 4
    },
    {
        day: 28,
        title: "Gratitude Reflection 🙏",
        category: "Good Deeds & Character",
        description: "We're almost at the end! Let's reflect on our Ramadan journey!",
        quest: "Share your favorite Ramadan memory so far!",
        howToComplete: "Tell your family what you loved most about this Ramadan. What did you learn?",
        parentTip: "Have a family sharing circle. Celebrate all the growth and beautiful moments!",
        points: 10,
        emoji: "🙏",
        week: 4
    },
    {
        day: 29,
        title: "Last Odd Night 🌙",
        category: "Faith & Worship",
        description: "This is it - our last odd night! Final chance for Laylatul Qadr!",
        quest: "Give it everything tonight - this might be Laylatul Qadr!",
        howToComplete: "Do every good deed you can! Make ALL your duas! We can do this!",
        parentTip: "Pour your heart out in dua. Encourage your child to ask Allah for everything they want.",
        points: 10,
        emoji: "🌙",
        week: 4
    },
    {
        day: 30,
        title: "Ramadan Completion! 🎉🎊",
        category: "Family Bonding",
        description: "WE DID IT! 30 DAYS OF AMAZING QUESTS! You are INCREDIBLE!",
        quest: "Prepare for Eid celebration tomorrow!",
        howToComplete: "Lay out your Eid clothes, help decorate, prepare for tomorrow's celebration! ALLAHU AKBAR!",
        parentTip: "Celebrate this achievement! Download the Achievement Certificate and celebrate your champion!",
        points: 10,
        emoji: "🎊",
        week: 4
    }
];

// Badge definitions
const badgesData = [
    {
        id: 'first-quest',
        name: 'First Quest',
        description: 'Completed your first quest!',
        emoji: '🌙',
        requirement: 1,
        message: 'Amazing! You\'ve started your Ramadan adventure!'
    },
    {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Completed 7 consecutive days!',
        emoji: '⭐',
        requirement: 7,
        message: 'One week down! You\'re on fire!'
    },
    {
        id: 'halfway-hero',
        name: 'Halfway Hero',
        description: 'Completed 15 quests!',
        emoji: '🏆',
        requirement: 15,
        message: 'Halfway there! Keep going, champion!'
    },
    {
        id: 'laylatul-qadr-seeker',
        name: 'Laylatul Qadr Seeker',
        description: 'Completed all odd night quests (21, 23, 25, 27, 29)!',
        emoji: '👑',
        requirement: 'odd-nights',
        message: 'You sought the Night of Power! May Allah accept your efforts!'
    },
    {
        id: 'ramadan-champion',
        name: 'Ramadan Champion',
        description: 'Completed all 30 quests!',
        emoji: '💎',
        requirement: 30,
        message: 'YOU DID IT! You\'re a true Ramadan Champion! 🎉'
    }
];

// export { questsData, badgesData };

// Export data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { questsData, badgesData };
}

