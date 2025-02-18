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
import { useColorMode } from "@vueuse/core";

import { ref, onMounted } from "vue";

type GradeEntry = {
  type: string;
  weight: number;
  grade: number;
};

type Category = {
  category: string;
  weight: number;
  grades: GradeEntry[];
};

type Subject = {
  name: string;
  grades: Category[];
};

const subjects = ref<Subject[]>([]);

onMounted(async () => {
  try {
    const response = await fetch("/db.json");
    const data = await response.json();
    console.log("Loaded Data:", data);
    subjects.value = data.subjects;
  } catch (error) {
    console.error("Error while loading data:", error);
  }
});

const calculateAverage = (categories: Category[]): string => {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const category of categories) {
    for (const grade of category.grades) {
      totalWeight += grade.weight * category.weight;
      weightedSum += grade.grade * grade.weight * category.weight;
    }
  }

  if (totalWeight === 0) {
    return "N/A";
  }

  return (weightedSum / totalWeight).toFixed(2);
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
    </header>
    <main
      class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10"
    >
      <h1 class="text-3xl font-semibold">Home</h1>
      <div>
        <Card v-for="subject in subjects" :key="subject.name" class="mt-4">
          <CardHeader>
            <CardTitle>{{ subject.name }}</CardTitle>
            <CardDescription>
              Average: {{ calculateAverage(subject.grades) }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              v-for="category in subject.grades"
              :key="category.category"
              class="mb-2"
            >
              <h3>{{ category.category }}</h3>
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
  </div>
</template>
