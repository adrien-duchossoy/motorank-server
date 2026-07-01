try { process.loadEnvFile() } catch (_) {}

const bcrypt = require("bcryptjs")
const connectDB = require("./db")
const User = require("./models/User.model")
const Review = require("./models/Review.model")
const Moto = require("./models/Moto.model")
const { brandNames, motoTypes } = require("./constants/moto.enums")

// ─── moto catalog ─────────────────────────────────────────────────────────────
// [brand, model, year, type, displacement, horsepower, torqueNm, weightKg, cylinders]

const MOTO_CATALOG = [
  // Yamaha
  ["Yamaha", "MT-07", 2021, "Naked", 689, 73, 68, 184, 2],
  ["Yamaha", "MT-09", 2023, "Naked", 890, 119, 93, 193, 3],
  ["Yamaha", "R1", 2020, "Sport", 998, 200, 113, 201, 4],
  ["Yamaha", "R6", 2019, "Sport", 599, 117, 61, 190, 4],
  ["Yamaha", "Tracer 9", 2022, "Adventure", 890, 119, 93, 204, 3],
  ["Yamaha", "Ténéré 700", 2021, "Trail", 689, 73, 68, 204, 2],
  ["Yamaha", "XSR900", 2022, "Naked", 890, 119, 93, 193, 3],
  ["Yamaha", "TMAX 560", 2022, "Scooter", 562, 47, 55, 216, 2],
  // Honda
  ["Honda", "CB650R", 2021, "Naked", 649, 95, 64, 202, 4],
  ["Honda", "CBR1000RR-R", 2020, "Sport", 999, 214, 113, 201, 4],
  ["Honda", "Africa Twin", 2022, "Adventure", 1084, 102, 105, 226, 2],
  ["Honda", "CB500F", 2019, "Naked", 471, 47, 43, 189, 2],
  ["Honda", "Hornet 750", 2023, "Naked", 755, 92, 75, 190, 2],
  ["Honda", "Monkey 125", 2022, "Naked", 125, 9, 11, 107, 1],
  ["Honda", "X-ADV", 2021, "Adventure", 745, 58, 69, 238, 2],
  ["Honda", "CB1000R", 2021, "Naked", 998, 143, 104, 213, 4],
  // Kawasaki
  ["Kawasaki", "Z900", 2020, "Naked", 948, 125, 98, 212, 4],
  ["Kawasaki", "Ninja 650", 2021, "Sport", 649, 67, 64, 196, 2],
  ["Kawasaki", "Z650RS", 2022, "Naked", 649, 67, 64, 187, 2],
  ["Kawasaki", "Ninja ZX-10R", 2021, "Sport", 998, 210, 114, 207, 4],
  ["Kawasaki", "Versys 1000", 2022, "Adventure", 1043, 120, 102, 255, 4],
  ["Kawasaki", "Z400", 2019, "Naked", 399, 45, 37, 167, 2],
  ["Kawasaki", "W800", 2021, "Naked", 773, 47, 62, 221, 2],
  ["Kawasaki", "KLR 650", 2022, "Enduro", 652, 53, 59, 192, 1],
  // Ducati
  ["Ducati", "Monster", 2021, "Naked", 937, 111, 93, 188, 2],
  ["Ducati", "Panigale V4", 2022, "Sport", 1103, 215, 124, 198, 4],
  ["Ducati", "Scrambler Icon", 2023, "Naked", 803, 73, 65, 189, 2],
  ["Ducati", "Multistrada V4", 2021, "Adventure", 1158, 170, 125, 228, 4],
  ["Ducati", "Hypermotard 950", 2022, "Supermoto", 937, 114, 96, 200, 2],
  ["Ducati", "Diavel V4", 2023, "Cruiser", 1158, 168, 129, 232, 4],
  // BMW
  ["BMW", "S1000RR", 2023, "Sport", 999, 210, 113, 197, 4],
  ["BMW", "R1250GS", 2021, "Adventure", 1254, 136, 143, 249, 2],
  ["BMW", "F900R", 2020, "Naked", 895, 105, 92, 212, 2],
  ["BMW", "S1000XR", 2022, "Adventure", 999, 167, 114, 228, 4],
  ["BMW", "R nineT", 2021, "Naked", 1170, 109, 116, 222, 2],
  ["BMW", "M1000RR", 2021, "Sport", 999, 212, 113, 193, 4],
  ["BMW", "G310R", 2022, "Naked", 313, 34, 28, 158, 1],
  // KTM
  ["KTM", "Duke 390", 2022, "Naked", 373, 44, 37, 149, 1],
  ["KTM", "Duke 790", 2019, "Naked", 799, 105, 87, 189, 2],
  ["KTM", "Duke 1290 Super", 2022, "Naked", 1301, 180, 140, 213, 2],
  ["KTM", "Adventure 890 R", 2021, "Adventure", 889, 105, 100, 198, 2],
  ["KTM", "RC 390", 2022, "Sport", 373, 44, 37, 163, 1],
  ["KTM", "790 Adventure", 2019, "Adventure", 799, 95, 88, 213, 2],
  // Suzuki
  ["Suzuki", "GSX-S1000", 2021, "Naked", 999, 150, 106, 214, 4],
  ["Suzuki", "V-Strom 650", 2021, "Adventure", 645, 71, 62, 216, 2],
  ["Suzuki", "SV650", 2020, "Naked", 645, 73, 64, 197, 2],
  ["Suzuki", "Hayabusa", 2021, "Sport", 1340, 187, 150, 264, 4],
  ["Suzuki", "GSX-8R", 2023, "Sport", 776, 82, 78, 203, 2],
  ["Suzuki", "V-Strom 1050", 2020, "Adventure", 1037, 107, 100, 247, 2],
  // Triumph
  ["Triumph", "Street Triple R", 2020, "Naked", 765, 118, 79, 167, 3],
  ["Triumph", "Tiger 900", 2020, "Adventure", 888, 95, 87, 193, 3],
  ["Triumph", "Bonneville T120", 2021, "Naked", 1200, 80, 105, 226, 2],
  ["Triumph", "Speed Triple 1200 RS", 2021, "Naked", 1160, 180, 125, 198, 3],
  ["Triumph", "Trident 660", 2021, "Naked", 660, 81, 64, 189, 3],
  ["Triumph", "Rocket 3 R", 2020, "Cruiser", 2458, 167, 221, 291, 3],
  // Aprilia
  ["Aprilia", "RS660", 2020, "Sport", 659, 100, 67, 169, 2],
  ["Aprilia", "Tuono V4", 2021, "Naked", 1077, 175, 121, 209, 4],
  ["Aprilia", "Tuono 660", 2021, "Naked", 659, 95, 67, 183, 2],
  ["Aprilia", "RSV4", 2021, "Sport", 1099, 217, 125, 202, 4],
  // Royal Enfield
  ["Royal Enfield", "Meteor 350", 2020, "Cruiser", 349, 20, 27, 191, 1],
  ["Royal Enfield", "Interceptor 650", 2019, "Naked", 648, 47, 52, 202, 2],
  ["Royal Enfield", "Himalayan 450", 2023, "Adventure", 452, 40, 40, 196, 1],
  ["Royal Enfield", "Super Meteor 650", 2023, "Cruiser", 648, 47, 52, 241, 2],
  // MV Agusta
  ["MV Agusta", "Brutale 800", 2021, "Naked", 798, 140, 87, 175, 3],
  ["MV Agusta", "F3 800", 2020, "Sport", 798, 148, 88, 173, 3],
  // Moto Guzzi
  ["Moto Guzzi", "V7 Stone", 2021, "Naked", 853, 65, 73, 209, 2],
  ["Moto Guzzi", "V85 TT", 2019, "Adventure", 853, 80, 80, 229, 2],
  // Harley-Davidson
  ["Harley-Davidson", "Sportster S", 2021, "Cruiser", 1252, 121, 127, 228, 2],
  ["Harley-Davidson", "Pan America 1250", 2021, "Adventure", 1252, 150, 128, 245, 2],
  ["Harley-Davidson", "Street Glide", 2023, "Touring", 1868, 93, 163, 369, 2],
  // Indian
  ["Indian", "Scout Bobber", 2022, "Cruiser", 1133, 100, 97, 253, 2],
  ["Indian", "FTR 1200", 2019, "Naked", 1203, 123, 120, 228, 2],
  // Zero
  ["Zero", "SR/F", 2022, "Naked", null, 110, 190, 220, null],
  ["Zero", "DSR/X", 2023, "Adventure", null, 100, 190, 244, null],
  // CFMoto
  ["CFMoto", "700CL-X", 2021, "Naked", 693, 70, 66, 195, 2],
  ["CFMoto", "800MT", 2022, "Adventure", 799, 95, 80, 215, 2],
]

function makeSlug(brand, model, year) {
  return `${brand}-${model}-${year}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── fake data helpers ────────────────────────────────────────────────────────

const firstNames = [
  "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Alexander",
  "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn",
  "Mason", "Ethan", "Daniel", "Matthew", "Aiden", "Jackson", "Sebastian", "Jack", "Owen", "Samuel",
  "Abigail", "Emily", "Elizabeth", "Sofia", "Avery", "Ella", "Scarlett", "Grace", "Chloe", "Victoria",
  "Michael", "Logan", "David", "Joseph", "Carter", "Owen", "Wyatt", "John", "Luke", "Julian",
  "Aria", "Lily", "Aurora", "Zoey", "Penelope", "Riley", "Nora", "Luna", "Eleanor", "Hannah",
]

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
]

const bios = [
  "Riding since I could reach the handlebars.",
  "Weekend warrior. Weekday commuter.",
  "Track days and mountain passes are my therapy.",
  "Collector of old iron. Rider of everything.",
  "Adventure rider. The longer the road, the better.",
  "Naked bikes only. Life is too short for fairings.",
  "Mechanic by day, racer by weekend.",
  "Two wheels move the soul.",
  "Alps, Pyrenees, Dolomites — been there, done that.",
  "Coffee and motorcycles. That's it.",
  "Born to ride. Forced to work.",
  "Chasing horizons one mile at a time.",
  "Vintage bikes enthusiast.",
  "Touring rider. 50k miles and counting.",
  "Track addict. Road legal machine.",
  null, null, null, null,
]

const comments = [
  "Absolutely love this bike. Best purchase I've made.",
  "Handles like a dream, especially on mountain roads.",
  "Great engine character but a bit heavy in traffic.",
  "Perfect for long-distance touring, very comfortable.",
  "Incredible power delivery, overtakes are effortless.",
  "Beautiful design but fuel consumption is a bit high.",
  "My all-time favorite, would buy again without hesitation.",
  "Solid bike overall, a few minor niggles but nothing serious.",
  "Great starter bike, forgiving and easy to manage.",
  "Lightweight and punchy, a real joy on twisty roads.",
  "Handling is razor sharp, very precise mid-corner.",
  "Unbeatable value for money at this price point.",
  "Took me a while to decide but zero regrets.",
  "A bit loud but the character more than makes up for it.",
  "Japanese reliability at its finest, not a single issue in 2 years.",
  "Ergonomics could be better for tall riders.",
  "Suspension is a bit stiff stock but nothing a setup can't fix.",
  "Looks stunning in person. Photos don't do it justice.",
  "Engine is smooth all the way to the redline.",
  "Would recommend to anyone looking for a do-it-all machine.",
  null,
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

// ─── main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await connectDB()

  // ── 0. seed motos ─────────────────────────────────────────────────────────────

  const motosToInsert = []

  for (const [brand, model, year, type, displacement, horsepower, torqueNm, weightKg, cylinders] of MOTO_CATALOG) {
    const slug = makeSlug(brand, model, year)
    const existing = await Moto.exists({ slug })
    if (existing) continue
    motosToInsert.push({
      brandName: brand,
      modelName: model,
      productionYear: year,
      type,
      ...(displacement ? { displacement } : {}),
      ...(horsepower ? { horsepower } : {}),
      ...(torqueNm ? { torqueNm } : {}),
      ...(weightKg ? { weightKg } : {}),
      ...(cylinders ? { cylinders } : {}),
      slug,
      averageRating: 0,
      ratingCount: 0,
    })
  }

  if (motosToInsert.length > 0) {
    await Moto.insertMany(motosToInsert, { ordered: false })
    console.log(`Created ${motosToInsert.length} motos`)
  } else {
    console.log("All seed motos already exist, skipping")
  }

  const motos = await Moto.find({}, "_id")
  const motoIds = motos.map((m) => m._id)
  console.log(`Total motos in DB: ${motoIds.length}`)

  // ── 1. create users ──────────────────────────────────────────────────────────

  const USER_COUNT = 2000
  const hashedPassword = await bcrypt.hash("Password123!", 10)

  console.log(`Creating ${USER_COUNT} users...`)

  const usersData = Array.from({ length: USER_COUNT }, (_, i) => {
    const firstName = rand(firstNames)
    const lastName = rand(lastNames)
    const num = String(i + 1).padStart(4, "0")
    const handle = `${firstName.toLowerCase()}${lastName.toLowerCase()}${num}`
    const status = i < 5 ? "admin" : "user"

    return {
      handle,
      email: `${handle}@motorank-seed.dev`,
      password: hashedPassword,
      displayName: `${firstName} ${lastName}`,
      description: rand(bios),
      status,
      reviewCount: 0,
      followers: [],
      following: [],
      favorites: [],
    }
  })

  await User.deleteMany({ email: /@motorank-seed\.dev$/ })
  const users = await User.insertMany(usersData)
  const userIds = users.map((u) => u._id)
  console.log(`Created ${users.length} users`)

  // ── 2. followers / following ─────────────────────────────────────────────────
  // top 30 users: 200-500 followers (influencers)
  // next 200 users: 30-150 followers (active users)
  // rest: 0-30 followers

  console.log("Building follower relationships...")

  const followersByUser = {}
  const followingByUser = {}

  for (let i = 0; i < userIds.length; i++) {
    let followerCount
    if (i < 30) followerCount = randInt(200, 500)
    else if (i < 230) followerCount = randInt(30, 150)
    else followerCount = randInt(0, 30)

    const pool = shuffle(userIds.filter((_, j) => j !== i))
    const myFollowers = pool.slice(0, Math.min(followerCount, pool.length))

    for (const followerId of myFollowers) {
      ;(followersByUser[userIds[i]] ??= []).push(followerId)
      ;(followingByUser[followerId] ??= []).push(userIds[i])
    }
  }

  const bulkFollowers = Object.entries(followersByUser).map(([id, followers]) => ({
    updateOne: { filter: { _id: id }, update: { $set: { followers } } },
  }))
  const bulkFollowing = Object.entries(followingByUser).map(([id, following]) => ({
    updateOne: { filter: { _id: id }, update: { $set: { following } } },
  }))

  await User.bulkWrite([...bulkFollowers, ...bulkFollowing])
  console.log("Follower relationships applied")

  // ── 3. reviews ───────────────────────────────────────────────────────────────

  if (motoIds.length === 0) {
    console.log("No motos — skipping reviews")
    return await disconnect()
  }

  console.log("Generating reviews...")

  const reviewDocs = []
  const seen = new Set()

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i]
    // top 30 (influencers) → 8-15 reviews, always verified
    // next 470 (active)    → 3-10 reviews, likely verified
    // rest                 → 0-6 reviews, mixed
    let count
    if (i < 30) count = randInt(8, 15)
    else if (i < 500) count = randInt(3, 10)
    else count = randInt(0, 6)

    if (count === 0) continue
    const myMotos = shuffle(motoIds).slice(0, Math.min(count, motoIds.length))
    for (const motoId of myMotos) {
      const key = `${userId}-${motoId}`
      if (seen.has(key)) continue
      seen.add(key)
      const comment = rand(comments)
      reviewDocs.push({
        motorcycleId: motoId,
        userId,
        rating: randInt(1, 5),
        ...(comment ? { comment } : {}),
        media: [],
      })
    }
  }

  await Review.deleteMany({ userId: { $in: userIds } })

  // insert in batches to avoid hitting document size limits
  const BATCH = 500
  for (let i = 0; i < reviewDocs.length; i += BATCH) {
    await Review.insertMany(reviewDocs.slice(i, i + BATCH), { ordered: false })
    process.stdout.write(`\r  ${Math.min(i + BATCH, reviewDocs.length)}/${reviewDocs.length} reviews inserted`)
  }
  console.log(`\nCreated ${reviewDocs.length} reviews`)

  // ── 4. sync reviewCount + status ─────────────────────────────────────────────

  console.log("Syncing reviewCount and status...")

  const reviewCountByUser = {}
  for (const r of reviewDocs) {
    reviewCountByUser[r.userId] = (reviewCountByUser[r.userId] ?? 0) + 1
  }

  const userCountUpdates = Object.entries(reviewCountByUser).map(([id, count]) => ({
    updateOne: {
      filter: { _id: id },
      update: {
        $set: {
          reviewCount: count,
          ...(count >= 5 ? { status: "verified" } : {}),
        },
      },
    },
  }))
  await User.bulkWrite(userCountUpdates)

  // restore admin status for the first 5 users
  await User.updateMany(
    { _id: { $in: userIds.slice(0, 5) } },
    { $set: { status: "admin" } }
  )
  console.log("reviewCount and status synced")

  // ── 5. sync moto averageRating + ratingCount ─────────────────────────────────

  console.log("Syncing moto ratings...")

  const ratingsByMoto = {}
  for (const r of reviewDocs) {
    const key = String(r.motorcycleId)
    ;(ratingsByMoto[key] ??= []).push(r.rating)
  }

  const motoBulk = Object.entries(ratingsByMoto).map(([id, ratings]) => ({
    updateOne: {
      filter: { _id: id },
      update: {
        $set: {
          ratingCount: ratings.length,
          averageRating: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
        },
      },
    },
  }))
  await Moto.bulkWrite(motoBulk)
  console.log(`Moto ratings updated for ${motoBulk.length} motorcycles`)

  await disconnect()
}

async function disconnect() {
  const mongoose = require("mongoose")
  await mongoose.disconnect()
  console.log("Done!")
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
