import User, { type UserRole } from "@/models/User"
import Address from "@/models/Address"
import Donor from "@/models/Donor"
import { seedAddresses } from "@/lib/seed-data/addresses"
import { seedDonors } from "@/lib/seed-data/donors"

interface SeedUser {
  name: string
  email: string
  password: string
  role: UserRole
}

const seedUsers: SeedUser[] = [
  {
    name: "Super Admin",
    email: "superadmin@test.com",
    password: "password",
    role: "SUPER_ADMIN",
  },
  {
    name: "Admin",
    email: "admin@test.com",
    password: "password",
    role: "ADMIN",
  },
  {
    name: "User",
    email: "user@test.com",
    password: "password",
    role: "USER",
  },
]

// Track if seeding has been attempted in this process instance
let seedingAttempted = false

function normalizeAddress(address: string) {
  return address.trim().toLowerCase()
}

interface SeedOptions {
  force?: boolean
}

export async function seedDatabase(options: SeedOptions = {}): Promise<void> {
  // Prevent multiple seeding attempts during hot reload
  if (seedingAttempted && !options.force) {
    return
  }

  try {
    console.log("[Seed] Starting database seeding...")

    const seededUsers = []

    for (const userData of seedUsers) {
      // Double-check if user already exists by email
      const existingUser = await User.findOne({ email: userData.email })

      if (existingUser) {
        console.log(`[Seed] User ${userData.email} already exists. Skipping...`)
        seededUsers.push(existingUser)
        continue
      }

      // Create the user (password will be hashed by the pre-save hook)
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      })

      await user.save()
      seededUsers.push(user)
      console.log(`[Seed] Created ${userData.role}: ${userData.email}`)
    }

    for (const address of seedAddresses) {
      await Address.updateOne(
        { normalizedLabel: normalizeAddress(address) },
        {
          $setOnInsert: {
            label: address,
            normalizedLabel: normalizeAddress(address),
            isActive: true,
          },
        },
        { upsert: true }
      )
    }

    console.log(`[Seed] Address reference data synced: ${seedAddresses.length}`)

    const seedOwner =
      seededUsers.find((user) => user.role === "SUPER_ADMIN") || seededUsers[0]

    if (!seedOwner) {
      throw new Error("Seed owner user was not created or found")
    }

    for (const donorData of seedDonors) {
      const existingDonor = await Donor.findOne({
        name: donorData.name,
        mobile: donorData.mobile,
      })

      if (existingDonor) {
        console.log(`[Seed] Donor ${donorData.name} already exists. Skipping...`)
        continue
      }

      await Donor.create({
        ...donorData,
        createdBy: seedOwner._id,
      })

      console.log(`[Seed] Created donor: ${donorData.name}`)
    }

    seedingAttempted = true
    console.log("[Seed] Database seeding completed successfully!")
  } catch (error) {
    console.error("[Seed] Error seeding database:", error)
    // Don't throw - allow app to continue even if seeding fails
  }
}

export default seedDatabase
