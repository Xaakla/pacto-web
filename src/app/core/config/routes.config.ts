export class AppRoutes {
  public static Empty = class {
    public static path: string = '';
  }

  public static Public = class {
    public static Auth = class {
      public static Signin = class {
        public static get path(): string {
          return `signin`;
        }
      }

      public static Signup = class {
        public static get path(): string {
          return `signup`;
        }
      }
    }
  }

  public static Dashboard = class {
    public static path: string = `dashboard`;

    public static Sales = class {
      public static get path(): string {
        return `${AppRoutes.Dashboard.path}/sales`;
      }

      public static New = class {
        public static get path(): string {
          return `${AppRoutes.Dashboard.Sales.path}/new`;
        }
      }
    }
  }
}
