import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  nome: string;
  role?: "admin" | "gerente" | "vendedor" | "instalador" | "financeiro";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the requesting user is authenticated and is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify they're admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: requestingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !requestingUser) {
      throw new Error("Unauthorized: Invalid token");
    }

    // Check if requesting user has admin role
    const { data: hasAdminRole } = await userClient.rpc("has_role", {
      _user_id: requestingUser.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      throw new Error("Unauthorized: Admin role required");
    }

    // Parse request body
    const { email, password, nome, role = "vendedor" }: CreateUserRequest = await req.json();

    if (!email || !password || !nome) {
      throw new Error("Email, password and nome are required");
    }

    // Validate role
    const validRoles = ["admin", "gerente", "vendedor", "instalador", "financeiro"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create the user using Admin API
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { nome },
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error("User creation failed");
    }

    // Create profile for the new user
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        user_id: newUser.user.id,
        nome,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail - profile can be created later
    }

    // Assign role to the new user
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role: role,
        created_by: requestingUser.id,
      });

    if (roleError) {
      console.error("Role assignment error:", roleError);
      // Don't fail - role can be assigned later
    }

    console.log(`User created successfully: ${newUser.user.id} with role: ${role}`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        email: newUser.user.email,
        role: role,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
