
import users from "./users.json" with { type: "json" };
import { supabase } from "./utils";

const updatedUsers = await Promise.all(
  users.map(async (user) => {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
        }
      }
    });

    if (error) {
      console.error(`[signUp] ${error.code} ${error.message}`);
      console.debug(`[signUp] ${error}`);
      return user;
    }

    console.log(`Created user ${user.email} with UUID: ${data.user?.id}`);

    return {
      ...user,
      uuid: data.user?.id,
    };
  })
);

Bun.write("./users.json", JSON.stringify(updatedUsers, null, 2) + "\n");