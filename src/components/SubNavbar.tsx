"use client";

import { useProfile } from "@/contexts/ProfileContext";
import { Paper, Group, Button } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";

export default function SubNavbar() {
  const { user } = useProfile();
  const pathname = usePathname() || "/";
  const router = useRouter();

  const navItems = [
    { label: "Kölcsönzés", href: "/kolcsonzes" },
    { label: "Kölcsönzéseim", href: "/kolcsonzeseim" },
    { label: "Eszközeim", href: "/eszkozeim" },
    { label: "Aktivitás", href: "/aktivitás" },
    { label: "Üzenetek", href: "/uzenetek" }
  ];

  const isSelected = (href: string) => {
    if (pathname === href) return true;
    return pathname.startsWith(href + "/");
  };

  return user ? (
    <Paper
      withBorder
      radius={0}
      className="w-full px-6 py-2 flex items-center"
      style={{ background: "var(--mantine-color-body)" }}
    >
      <Group gap="md" className="ml-2">
        {navItems.map((item) => {
          const selected = isSelected(item.href);

          return (
            <Button
              key={item.href}
              variant={selected ? "filled" : "subtle"}
              size="xs"
              radius="sm"
              onClick={() => router.push(item.href)}
              className={selected ? "font-semibold" : ""}
            >
              {item.label}
            </Button>
          );
        })}
      </Group>
    </Paper>
  ) : null;
}
