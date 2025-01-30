"use server";
import { readUserSession } from "@/lib/actions";
import { createSupbaseAdmin, createSupbaseServerClient } from "@/lib/supabase";
import { revalidatePath, unstable_noStore } from "next/cache";

export async function createMember(data: {
  name: string;
  role: "user" | "admin";
  status: "active" | "resigned";
  email: string;
  password: string;
  confirm: string;
}) {
  const { data: userSession } = await readUserSession();

  // admin only
  if (userSession.session?.user?.user_metadata.role !== "admin") {
    return JSON.stringify({ error: { message: "You are not allowed to do this!" } });
  }

  const supabase = await createSupbaseAdmin();

  //create account
  const createResult = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      role: data.role,
    },
  });

  if (createResult.error?.message) {
    return JSON.stringify(createResult);
  } else {
    //create member
    const memberResult = await supabase.from("member").insert({
      name: data.name,
      id: createResult.data?.user?.id,
    });

    if (memberResult.error?.message) {
      return JSON.stringify(memberResult);
    } else {
      //create permissions
      const permissionResult = await supabase.from("permission").insert({
        role: data.role,
        member_id: createResult.data?.user?.id,
        status: data.status,
      });
      revalidatePath("dasboard/member");
      return JSON.stringify(permissionResult);
    }
  }
}
export async function updateMemberById(id: string) {
  console.log("update member");
}
export async function deleteMemberById(user_id: string) {
  const { data: userSession } = await readUserSession();

  //Admin only
  if (userSession.session?.user?.user_metadata.role !== "admin") {
    return JSON.stringify({ error: { message: "You are not allowed to do this!" } });
  }

  const supabaseAdmin = await createSupbaseAdmin();

  const deleteResult = await supabaseAdmin.auth.admin.deleteUser(user_id);

  if (deleteResult.error?.message) {
    return JSON.stringify(deleteResult);
  } else {
    //delete member
    const supabase = await createSupbaseServerClient();
    const memberResult = await supabase.from("member").delete().eq("id", user_id);
    revalidatePath("dasboard/member");
    return JSON.stringify(memberResult);
  }
}
export async function readMembers() {
  unstable_noStore();

  const supabase = await createSupbaseServerClient();
  return await supabase.from("permission").select("*, member(*)");
}
