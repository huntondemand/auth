import { defineNuxtModule, addPlugin, createResolver, logger, addImportsDir, addTemplate } from '@nuxt/kit'
import { fileURLToPath } from "url";
import type { PublicConfig, PrivateConfig } from "./runtime/types";
export interface ModuleOptions extends PrivateConfig, PublicConfig { }
import { defu } from "defu";
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'auth-module',
    configKey: 'auth'
  },

  defaults: {
    baseUrl: "http://localhost:3000",
    enableGlobalAuthMiddleware: false,
    cookieOptions: {
      name: 'hod'
    },
    redirect: {
      login: "",
      logout: "",
      home: "",
      callback: "",
      passwordReset: "",
      emailVerify: "",
    },
  },
  setup(options, nuxt) {
    const name = 'auth-module'
    if (!options.redirect.login) {
      logger.warn(`Please make sure to set login redirect path in ${name}`);
    }

    if (!options.redirect.logout) {
      logger.warn(`Please make sure to set logout redirect path in ${name}`);
    }

    if (!options.redirect.home) {
      logger.warn(`Please make sure to set home redirect path in ${name}`);
    }

    if (!options.baseUrl) {
      logger.warn(`Please make sure to set baseUrl in ${name}`);
    }

    //Get the runtime directory
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));

    //Transpile the runtime directory
    nuxt.options.build.transpile.push(runtimeDir);

    //Add plugins
    const plugin = resolve(runtimeDir, "plugin");
    addPlugin(plugin);

    //Add composables directory
    const composables = resolve(runtimeDir, "composables");
    addImportsDir(composables);

    //Create virtual imports for server-side
    nuxt.hook("nitro:config", (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {};

      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(
        typeof nitroConfig.externals === "object" ? nitroConfig.externals : {},
        {
          inline: [resolve(runtimeDir)],
        }
      );
      nitroConfig.alias["#auth"] = resolve(runtimeDir, "server/utils");
    });

    // TODO: generate Type for USer and Token Payload

    addTemplate({
      filename: "types/auth.d.ts",
      getContents: () =>
        [
          "declare module '#auth' {",
          `  const verifyAccessToken: typeof import('${resolve(
            runtimeDir,
            "server/utils"
          )}').verifyAccessToken`,
          `  const getAccessTokenFromHeader: typeof import('${resolve(
            runtimeDir,
            "server/utils"
          )}').getAccessTokenFromHeader`,
          `  const sendMail: typeof import('${resolve(
            runtimeDir,
            "server/utils"
          )}').sendMail`,
          `  const handleError: typeof import('${resolve(
            runtimeDir,
            "server/utils"
          )}').handleError`,
          `  const prisma: typeof import('${resolve(
            runtimeDir,
            "server/utils"
          )}').prisma`,
          "}",
        ].join("\n"),
    });

    // Register module types
    nuxt.hook("prepare:types", (options) => {
      options.references.push({
        path: resolve(nuxt.options.buildDir, "types/auth.d.ts"),
      });
    });

    //Initialize the module options
    nuxt.options.runtimeConfig = defu(nuxt.options.runtimeConfig, {
      app: {},
      public: {
        auth: {
          baseUrl: options.baseUrl,
          enableGlobalAuthMiddleware: options.enableGlobalAuthMiddleware,
          redirect: {
            login: options.redirect.login,
            logout: options.redirect.logout,
            home: options.redirect.home,
            callback: options.redirect.callback,
            passwordReset: options.redirect.passwordReset,
            emailVerify: options.redirect.emailVerify,
          },
          cookieOptions: {
            name: options.cookieOptions?.name
          }
        },
      },
    });
  }
})
