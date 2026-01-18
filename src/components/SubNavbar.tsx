"use client";

import { useProfile } from "@/contexts/ProfileContext";
import { Paper, Group, Button, Indicator } from "@mantine/core"; // Added Indicator
import { usePathname, useRouter } from "next/navigation";

export default function SubNavbar() {
  // Pull pendingCount from context
  const { user, pendingCount } = useProfile();
  const pathname = usePathname() || "/";
  const router = useRouter();

  const navItems = [
    { label: "Kölcsönzés", href: "/" },
    { label: "Kölcsönzéseim", href: "/kolcsonzeseim" },
    { label: "Eszközeim", href: "/eszkozeim" },
    { label: "Aktivitás", href: "/aktivitas", showBadge: true }, // Mark this item
    { label: "Üzenetek", href: "/uzenetek" }
  ];

  const isSelected = (href: string) => {
    if (pathname === href) return true;
    return pathname.startsWith(href + "/");
  };

  return user ? (
    <Paper withBorder radius={0} className="w-full px-6 py-2 flex items-center" style={{ background: "var(--mantine-color-body)" }}>
      <Group gap="md" className="ml-2">
        {navItems.map((item) => {
          const selected = isSelected(item.href);

          // Logic to show dot only on "Aktivitás" and only if count > 0
          const showDot = item.showBadge && pendingCount > 0;

          return (
            <Indicator
              key={item.href}
              disabled={!showDot}
              color="red"
              size={9}
              offset={2}
              processing // This makes the dot pulse
            >
              <Button
                variant={selected ? "filled" : "subtle"}
                size="xs"
                radius="sm"
                onClick={() => router.push(item.href)}
                className={selected ? "font-semibold" : ""}
              >
                {item.label}
              </Button>
            </Indicator>
          );
        })}
      </Group>
    </Paper>
  ) : null;
}