"use client";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import React from "react";

export default function DeleteMember({ user_id }: { user_id: string }) {
  const onSubmit = () => {
    console.log(user_id);
  };
  return (
    <form action={onSubmit}>
      <Button variant="outline">
        <TrashIcon />
        Delete
      </Button>
    </form>
  );
}
