<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Menu, GraduationCap, Moon, Sun } from "lucide-vue-next";

import { supabase } from "@/utils/supabase";

import { useColorMode } from "@vueuse/core";
import { ref, onMounted, onUnmounted } from "vue";
import LoginForm from "./components/LoginForm.vue";

type GradeEntry = {
  type: string;
  weight: number;
  grade: number;
};

type Category = {
  name: string;
  weight: number;
  grades: GradeEntry[];
};

type Subject = {
  name: string;
  abbreviation: string;
  teacher: string;
  categories: {
    name: string;
    weight: number;
    grades: {
      type: string;
      weight: number;
      grade: number;
    }[];
  }[];
};

// Add these new refs for authentication
const user = ref<any>(null);
const email = ref("");
const password = ref("");
const error = ref<string | null>(null);

// Add these authentication functions
const signIn = async () => {
  try {
    const {
      data: { user: signedInUser },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (signInError) {
      throw signInError;
    }

    user.value = signedInUser;
    error.value = null;
    console.log("User signed in:", user.value);
    // You can now fetch data after successful login
    await loadData();
  } catch (err: any) {
    error.value = err.message;
    console.error("Error signing in:", error.value);
  }
};

// Rename your existing data loading to this function
const loadData = async () => {
  try {
    const { data, error } = await supabase.from("subjects").select(`
      name,
      abbreviation,
      teacher,
      categories (
        name,
        weight,
        grades (
          type,
          weight,
          grade
        )
      )
    `);
    if (error) throw error;
    subjects.value = data;
  } catch (err) {
    console.error("Error while loading data from Supabase:", err);
  }
};

const logOut = async () => {
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error("Error signing out:", signOutError.message);
  } else {
    user.value = null;
    console.log("User signed out");
  }
};

const subjects = ref<Subject[]>([]);

let authSubscription: { unsubscribe: () => void } | null = null;

onMounted(async () => {
  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (currentUser) {
      user.value = currentUser;
      await loadData();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        user.value = null;
        subjects.value = [];
      } else if (event === "SIGNED_IN" && session) {
        user.value = session.user;
        loadData();
      }
    });

    authSubscription = subscription;
  } catch (err) {
    console.error("Error checking authentication:", err);
  }
});

onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe();
  }
});

const handleLogin = (credentials: any) => {
  email.value = credentials.email;
  password.value = credentials.password;
  signIn();
};

const calculateAverage = (categories: Category[]): string => {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const category of categories) {
    let categoryGradeSum = 0;
    let categoryWeightSum = 0;

    for (const grade of category.grades) {
      categoryGradeSum += grade.grade * grade.weight;
      categoryWeightSum += grade.weight;
    }

    const categoryAverage =
      categoryWeightSum > 0 ? categoryGradeSum / categoryWeightSum : 0;

    if (categoryWeightSum > 0) {
      weightedSum += categoryAverage * category.weight;
      totalWeight += category.weight;
    } else {
      console.info(`Category ${category.name} has no grades. Skipping.`);
    }
  }

  if (totalWeight === 0) {
    return "N/A";
  }

  return (Math.floor((weightedSum / totalWeight) * 100) / 100).toFixed(2);
};

const mode = useColorMode();
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <header
      class="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50"
    >
      <nav
        class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
      >
        <a
          href="#"
          class="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <GraduationCap class="h-6 w-6" />
          <span class="sr-only">Grade Tracker</span>
        </a>
        <a
          href="#"
          class="text-foreground transition-colors hover:text-foreground"
        >
          Home
        </a>
        <a
          href="#"
          class="text-muted-foreground transition-colors hover:text-foreground"
        >
          Grades
        </a>
        <a
          href="#"
          class="text-muted-foreground transition-colors hover:text-foreground"
        >
          Subjects
        </a>
        <a
          href="#"
          class="text-muted-foreground transition-colors hover:text-foreground"
        >
          Settings
        </a>
      </nav>
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="shrink-0 md:hidden">
            <Menu class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
          <p class="shrink-0 md:hidden text-lg font-semibold">Grade Tracker</p>
        </SheetTrigger>
        <SheetContent side="left">
          <nav class="grid gap-6 text-lg font-medium">
            <a href="#" class="flex items-center gap-2 text-lg font-semibold">
              <GraduationCap class="h-6 w-6" />
              <span class="sr-only">Grade Tracker</span>
            </a>
            <a href="#" class="hover:text-foreground"> Home </a>
            <a href="#" class="text-muted-foreground hover:text-foreground">
              Grades
            </a>
            <a href="#" class="text-muted-foreground hover:text-foreground">
              Subjects
            </a>
            <a href="#" class="text-muted-foreground hover:text-foreground">
              Settings
            </a>
          </nav>
        </SheetContent>
      </Sheet>
      <div class="flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              <Moon
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Sun
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button v-if="user" @click="logOut">Log out</Button>
      </div>
    </header>
    <main
      class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10"
    >
      <h1 class="text-3xl font-semibold">Home</h1>
      <div v-if="!user">
        <LoginForm @login="handleLogin" />
      </div>
      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <div v-if="user">
        <Card v-for="subject in subjects" :key="subject.name" class="mt-4">
          <CardHeader>
            <CardTitle>{{ subject.name }}</CardTitle>
            <CardDescription>
              Average: {{ calculateAverage(subject.categories) }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              v-for="category in subject.categories"
              :key="category.name"
              class="mb-2"
            >
              <h3>{{ category.name }}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[100px]">Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="grade in category.grades" :key="grade.type">
                    <TableCell>{{ grade.type }}</TableCell>
                    <TableCell>{{ grade.weight }}</TableCell>
                    <TableCell>{{ grade.grade }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    <footer>
      <p class="text-center text-muted-foreground bg-muted/40 text-sm py-4">
        &copy; 2025 Grade Tracker
      </p>
    </footer>
  </div>
</template>
