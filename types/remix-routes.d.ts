declare module "remix-routes" {
  type URLSearchParamsInit = string | string[][] | Record<string, string> | URLSearchParams;
  // symbol won't be a key of SearchParams
  type IsSearchParams<T> = symbol extends keyof T ? false : true;
  
  type ExportedQuery<T> = IsSearchParams<T> extends true ? T : URLSearchParamsInit;
  

  export interface Routes {
  
    "": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/index').SearchParams>,
    };
  
    "/": {
      params: never,
      query: ExportedQuery<import('../app/root').SearchParams>,
    };
  
    "/*": {
      params: {
        "*": string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/$').SearchParams>,
    };
  
    "/about": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/about').SearchParams>,
    };
  
    "/admin": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/index').SearchParams>,
    };
  
    "/admin/*": {
      params: {
        "*": string | number;
      } ,
      query: ExportedQuery<import('../app/routes/admin/$').SearchParams>,
    };
  
    "/admin/categories": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/categories').SearchParams>,
    };
  
    "/admin/comments": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/comments').SearchParams>,
    };
  
    "/admin/dashboard": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/dashboard').SearchParams>,
    };
  
    "/admin/deploy": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/deploy').SearchParams>,
    };
  
    "/admin/issues": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/issues').SearchParams>,
    };
  
    "/admin/messages": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/messages').SearchParams>,
    };
  
    "/admin/posts": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/posts').SearchParams>,
    };
  
    "/admin/test": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/test').SearchParams>,
    };
  
    "/admin/users": {
      params: never,
      query: ExportedQuery<import('../app/routes/admin/users').SearchParams>,
    };
  
    "/all/:feature": {
      params: {
        feature: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/all.$feature').SearchParams>,
    };
  
    "/api/account/delete": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/account.delete').SearchParams>,
    };
  
    "/api/actions/set-theme": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/actions.set-theme').SearchParams>,
    };
  
    "/api/category/create": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/category/create').SearchParams>,
    };
  
    "/api/category/delete": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/category/delete').SearchParams>,
    };
  
    "/api/category/deleteMany": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/category/deleteMany').SearchParams>,
    };
  
    "/api/category/edit": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/category/edit').SearchParams>,
    };
  
    "/api/category/verify": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/category/verify').SearchParams>,
    };
  
    "/api/comment": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/comment').SearchParams>,
    };
  
    "/api/comment/delete": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/comment/delete').SearchParams>,
    };
  
    "/api/comment/verify": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/comment/verify').SearchParams>,
    };
  
    "/api/fetch/categories": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/fetch.categories').SearchParams>,
    };
  
    "/api/fetch/feed": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/fetch.feed').SearchParams>,
    };
  
    "/api/fetch/tags": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/fetch.tags').SearchParams>,
    };
  
    "/api/follow/user": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/follow/user').SearchParams>,
    };
  
    "/api/healthcheck": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/healthcheck').SearchParams>,
    };
  
    "/api/issue/create": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/issue/create').SearchParams>,
    };
  
    "/api/issue/delete": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/issue/delete').SearchParams>,
    };
  
    "/api/like/comment": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/like/comment').SearchParams>,
    };
  
    "/api/like/post": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/like/post').SearchParams>,
    };
  
    "/api/logout": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/logout').SearchParams>,
    };
  
    "/api/me": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/me').SearchParams>,
    };
  
    "/api/notifications": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/notifications').SearchParams>,
    };
  
    "/api/notifications/:id/read": {
      params: {
        id: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/api/notifications.$id.read').SearchParams>,
    };
  
    "/api/post/create": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/post/create').SearchParams>,
    };
  
    "/api/post/delete": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/post/delete').SearchParams>,
    };
  
    "/api/post/sensitive": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/post/sensitive').SearchParams>,
    };
  
    "/api/post/verify": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/post/verify').SearchParams>,
    };
  
    "/api/users/delete": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/users/delete').SearchParams>,
    };
  
    "/api/users/email/verify": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/users/email.verify').SearchParams>,
    };
  
    "/api/users/verify": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/users/verify').SearchParams>,
    };
  
    "/api/verify/email": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/verify.email').SearchParams>,
    };
  
    "/api/vote/comment": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/vote/comment').SearchParams>,
    };
  
    "/api/vote/post": {
      params: never,
      query: ExportedQuery<import('../app/routes/api/vote/post').SearchParams>,
    };
  
    "/app": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/index').SearchParams>,
    };
  
    "/app/*": {
      params: {
        "*": string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/$').SearchParams>,
    };
  
    "/app/about": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/about').SearchParams>,
    };
  
    "/app/all/:feature": {
      params: {
        feature: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/all.$feature').SearchParams>,
    };
  
    "/app/category/:slug": {
      params: {
        slug: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/category.$slug').SearchParams>,
    };
  
    "/app/feed/:slug": {
      params: {
        slug: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/feed.$slug').SearchParams>,
    };
  
    "/app/hot": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/hot').SearchParams>,
    };
  
    "/app/privacy": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/privacy').SearchParams>,
    };
  
    "/app/profile": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/profile/index').SearchParams>,
    };
  
    "/app/profile/password": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/profile/password').SearchParams>,
    };
  
    "/app/tag/:tagId": {
      params: {
        tagId: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/tag.$tagId').SearchParams>,
    };
  
    "/app/terms": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/terms/index').SearchParams>,
    };
  
    "/app/trending": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/trending').SearchParams>,
    };
  
    "/app/user/:username": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/index').SearchParams>,
    };
  
    "/app/user/:username/bookmarks": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/bookmarks').SearchParams>,
    };
  
    "/app/user/:username/comments": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/comments').SearchParams>,
    };
  
    "/app/user/:username/posts": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/posts').SearchParams>,
    };
  
    "/app/user/:username/votes": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/votes').SearchParams>,
    };
  
    "/app/waiting": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/waiting').SearchParams>,
    };
  
    "/category/:slug": {
      params: {
        slug: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/category.$slug').SearchParams>,
    };
  
    "/contact": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/contact').SearchParams>,
    };
  
    "/feed/:slug": {
      params: {
        slug: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/feed.$slug').SearchParams>,
    };
  
    "/forgot-password": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/forgot-password/index').SearchParams>,
    };
  
    "/guest": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)').SearchParams>,
    };
  
    "/guest/contact": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/contact').SearchParams>,
    };
  
    "/guest/forgot-password": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/forgot-password/index').SearchParams>,
    };
  
    "/guest/oauth/:provider": {
      params: {
        provider: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/oauth/$provider').SearchParams>,
    };
  
    "/guest/oauth/:provider/callback": {
      params: {
        provider: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/oauth/$provider.callback').SearchParams>,
    };
  
    "/guest/reset-password/:token": {
      params: {
        token: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/reset-password/$token').SearchParams>,
    };
  
    "/guest/signin": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/signin/index').SearchParams>,
    };
  
    "/guest/signup": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/signup/index').SearchParams>,
    };
  
    "/guest/verify/:token": {
      params: {
        token: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/verify/$token').SearchParams>,
    };
  
    "/hot": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/hot').SearchParams>,
    };
  
    "/manifest.webmanifest": {
      params: never,
      query: ExportedQuery<import('../app/routes/manifest[.webmanifest]').SearchParams>,
    };
  
    "/oauth/:provider": {
      params: {
        provider: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/oauth/$provider').SearchParams>,
    };
  
    "/oauth/:provider/callback": {
      params: {
        provider: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/oauth/$provider.callback').SearchParams>,
    };
  
    "/privacy": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/privacy').SearchParams>,
    };
  
    "/profile": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/profile/index').SearchParams>,
    };
  
    "/profile/password": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/profile/password').SearchParams>,
    };
  
    "/reset-password/:token": {
      params: {
        token: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/reset-password/$token').SearchParams>,
    };
  
    "/signin": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/signin/index').SearchParams>,
    };
  
    "/signup": {
      params: never,
      query: ExportedQuery<import('../app/routes/(guest)/signup/index').SearchParams>,
    };
  
    "/tag/:tagId": {
      params: {
        tagId: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/tag.$tagId').SearchParams>,
    };
  
    "/terms": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/terms/index').SearchParams>,
    };
  
    "/trending": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/trending').SearchParams>,
    };
  
    "/user/:username": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/index').SearchParams>,
    };
  
    "/user/:username/bookmarks": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/bookmarks').SearchParams>,
    };
  
    "/user/:username/comments": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/comments').SearchParams>,
    };
  
    "/user/:username/posts": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/posts').SearchParams>,
    };
  
    "/user/:username/votes": {
      params: {
        username: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(app)/user.$username/votes').SearchParams>,
    };
  
    "/verify/:token": {
      params: {
        token: string | number;
      } ,
      query: ExportedQuery<import('../app/routes/(guest)/verify/$token').SearchParams>,
    };
  
    "/waiting": {
      params: never,
      query: ExportedQuery<import('../app/routes/(app)/waiting').SearchParams>,
    };
  
  }

  type RoutesWithParams = Pick<
    Routes,
    {
      [K in keyof Routes]: Routes[K]["params"] extends Record<string, never> ? never : K
    }[keyof Routes]
  >;

  export type RouteId =
    | 'root'
    | 'routes/(app)'
    | 'routes/(app)/__post'
    | 'routes/(app)/$'
    | 'routes/(app)/about'
    | 'routes/(app)/all.$feature'
    | 'routes/(app)/category.$slug'
    | 'routes/(app)/feed.$slug'
    | 'routes/(app)/hot'
    | 'routes/(app)/index'
    | 'routes/(app)/privacy'
    | 'routes/(app)/profile/index'
    | 'routes/(app)/profile/password'
    | 'routes/(app)/tag.$tagId'
    | 'routes/(app)/terms'
    | 'routes/(app)/terms/index'
    | 'routes/(app)/trending'
    | 'routes/(app)/user.$username'
    | 'routes/(app)/user.$username/bookmarks'
    | 'routes/(app)/user.$username/comments'
    | 'routes/(app)/user.$username/index'
    | 'routes/(app)/user.$username/posts'
    | 'routes/(app)/user.$username/votes'
    | 'routes/(app)/waiting'
    | 'routes/(guest)'
    | 'routes/(guest)/contact'
    | 'routes/(guest)/forgot-password/index'
    | 'routes/(guest)/oauth/$provider'
    | 'routes/(guest)/oauth/$provider.callback'
    | 'routes/(guest)/reset-password/$token'
    | 'routes/(guest)/signin/index'
    | 'routes/(guest)/signup/index'
    | 'routes/(guest)/verify/$token'
    | 'routes/admin'
    | 'routes/admin/$'
    | 'routes/admin/categories'
    | 'routes/admin/comments'
    | 'routes/admin/dashboard'
    | 'routes/admin/deploy'
    | 'routes/admin/index'
    | 'routes/admin/issues'
    | 'routes/admin/messages'
    | 'routes/admin/posts'
    | 'routes/admin/test'
    | 'routes/admin/users'
    | 'routes/api/account.delete'
    | 'routes/api/actions.set-theme'
    | 'routes/api/category/create'
    | 'routes/api/category/delete'
    | 'routes/api/category/deleteMany'
    | 'routes/api/category/edit'
    | 'routes/api/category/verify'
    | 'routes/api/comment'
    | 'routes/api/comment/delete'
    | 'routes/api/comment/verify'
    | 'routes/api/fetch.categories'
    | 'routes/api/fetch.feed'
    | 'routes/api/fetch.tags'
    | 'routes/api/follow/user'
    | 'routes/api/healthcheck'
    | 'routes/api/issue/create'
    | 'routes/api/issue/delete'
    | 'routes/api/like/comment'
    | 'routes/api/like/post'
    | 'routes/api/logout'
    | 'routes/api/me'
    | 'routes/api/notifications'
    | 'routes/api/notifications.$id.read'
    | 'routes/api/post/create'
    | 'routes/api/post/delete'
    | 'routes/api/post/sensitive'
    | 'routes/api/post/verify'
    | 'routes/api/users/delete'
    | 'routes/api/users/email.verify'
    | 'routes/api/users/verify'
    | 'routes/api/verify.email'
    | 'routes/api/vote/comment'
    | 'routes/api/vote/post'
    | 'routes/manifest[.webmanifest]';

  export function $path<
    Route extends keyof Routes,
    Rest extends {
      params: Routes[Route]["params"];
      query?: Routes[Route]["query"];
    }
  >(
    ...args: Rest["params"] extends Record<string, never>
      ? [route: Route, query?: Rest["query"]]
      : [route: Route, params: Rest["params"], query?: Rest["query"]]
  ): string;

  export function $params<
    Route extends keyof RoutesWithParams,
    Params extends RoutesWithParams[Route]["params"]
  >(
      route: Route,
      params: { readonly [key: string]: string | undefined }
  ): {[K in keyof Params]: string};

  export function $routeId(routeId: RouteId): RouteId;
}