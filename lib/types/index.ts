export type IPermission = {
  id: string;
  created_at: string;
  role: "admin" | "user";
  status: "active" | "resigned";
  member_id: string;
  member: {
    id: string;
    name: string;
    created_at: string;
  };
};
