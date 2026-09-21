import __vite__cjsImport0_react_jsxDevRuntime from "/@fs/home/ubuntu/lobehub-clone/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=20dfacec"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import { trpc } from "/src/lib/trpc.ts";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "/@fs/home/ubuntu/lobehub-clone/shared/const.ts";
import { QueryClient, QueryClientProvider } from "/@fs/home/ubuntu/lobehub-clone/node_modules/.vite/deps/@tanstack_react-query.js?v=20dfacec";
import { httpBatchLink, TRPCClientError } from "/@fs/home/ubuntu/lobehub-clone/node_modules/.vite/deps/@trpc_client.js?v=20dfacec";
import __vite__cjsImport5_reactDom_client from "/@fs/home/ubuntu/lobehub-clone/node_modules/.vite/deps/react-dom_client.js?v=20dfacec"; const createRoot = __vite__cjsImport5_reactDom_client["createRoot"];
import superjson from "/@fs/home/ubuntu/lobehub-clone/node_modules/.vite/deps/superjson.js?v=20dfacec";
import App from "/src/App.tsx";
import { startLogin } from "/src/const.ts";
import "/src/index.css";
const queryClient = new QueryClient();
const redirectToLoginIfUnauthorized = (error) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;
  startLogin();
};
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});
queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find((s) => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...init ?? {},
          credentials: "include"
        });
      }
    })
  ]
});
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(trpc.Provider, { "data-loc": "client/src/main.tsx:76", client: trpcClient, queryClient, children: /* @__PURE__ */ jsxDEV(QueryClientProvider, { "data-loc": "client/src/main.tsx:77", client: queryClient, children: /* @__PURE__ */ jsxDEV(App, { "data-loc": "client/src/main.tsx:78" }, void 0, false, {
    fileName: "/home/ubuntu/lobehub-clone/client/src/main.tsx",
    lineNumber: 78,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/home/ubuntu/lobehub-clone/client/src/main.tsx",
    lineNumber: 77,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "/home/ubuntu/lobehub-clone/client/src/main.tsx",
    lineNumber: 76,
    columnNumber: 3
  }, this)
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBNkVNO0FBN0VOLFNBQVNBLFlBQVk7QUFDckIsU0FBU0MsYUFBYUMsd0JBQXdCO0FBQzlDLFNBQVNDLGFBQWFDLDJCQUEyQjtBQUNqRCxTQUFTQyxlQUFlQyx1QkFBdUI7QUFDL0MsU0FBU0Msa0JBQWtCO0FBQzNCLE9BQU9DLGVBQWU7QUFDdEIsT0FBT0MsU0FBUztBQUNoQixTQUFTQyxrQkFBa0I7QUFDM0IsT0FBTztBQUVQLE1BQU1DLGNBQWMsSUFBSVIsWUFBWTtBQUVwQyxNQUFNUyxnQ0FBZ0NBLENBQUNDLFVBQW1CO0FBQ3hELE1BQUksRUFBRUEsaUJBQWlCUCxpQkFBa0I7QUFDekMsTUFBSSxPQUFPUSxXQUFXLFlBQWE7QUFFbkMsUUFBTUMsaUJBQWlCRixNQUFNRyxZQUFZZDtBQUV6QyxNQUFJLENBQUNhLGVBQWdCO0FBRXJCTCxhQUFXO0FBQ2I7QUFFQUMsWUFBWU0sY0FBYyxFQUFFQyxVQUFVLENBQUFDLFVBQVM7QUFDN0MsTUFBSUEsTUFBTUMsU0FBUyxhQUFhRCxNQUFNRSxPQUFPRCxTQUFTLFNBQVM7QUFDN0QsVUFBTVAsUUFBUU0sTUFBTUcsTUFBTUMsTUFBTVY7QUFDaENELGtDQUE4QkMsS0FBSztBQUNuQ1csWUFBUVgsTUFBTSxxQkFBcUJBLEtBQUs7QUFBQSxFQUMxQztBQUNGLENBQUM7QUFFREYsWUFBWWMsaUJBQWlCLEVBQUVQLFVBQVUsQ0FBQUMsVUFBUztBQUNoRCxNQUFJQSxNQUFNQyxTQUFTLGFBQWFELE1BQU1FLE9BQU9ELFNBQVMsU0FBUztBQUM3RCxVQUFNUCxRQUFRTSxNQUFNTyxTQUFTSCxNQUFNVjtBQUNuQ0Qsa0NBQThCQyxLQUFLO0FBQ25DVyxZQUFRWCxNQUFNLHdCQUF3QkEsS0FBSztBQUFBLEVBQzdDO0FBQ0YsQ0FBQztBQUVELE1BQU1jLGFBQWEzQixLQUFLNEIsYUFBYTtBQUFBLEVBQ25DQyxPQUFPO0FBQUEsSUFDTHhCLGNBQWM7QUFBQSxNQUNaeUIsS0FBSztBQUFBLE1BQ0xDLGFBQWF2QjtBQUFBQSxNQUNid0IsVUFBVTtBQUtSLFlBQUk7QUFDRixnQkFBTUMsTUFBTUMsZUFBZUMsUUFBUSxjQUFjO0FBQ2pELGNBQUlGLEtBQUs7QUFDUCxrQkFBTUcsU0FBUyxHQUFHbkMsV0FBVztBQUM3QixrQkFBTW9DLE9BQU9KLElBQUlLLE1BQU0sR0FBRyxFQUFFQyxLQUFLLENBQUFDLE1BQUtBLEVBQUVDLEtBQUssRUFBRUMsV0FBV04sTUFBTSxDQUFDO0FBQ2pFLGtCQUFNTyxRQUFRTixNQUFNSSxLQUFLLEVBQUVHLE1BQU1SLE9BQU9TLE1BQU07QUFDOUMsZ0JBQUlGLE9BQU87QUFDVCxxQkFBTyxFQUFFRyxlQUFlLFVBQVVILEtBQUssR0FBRztBQUFBLFlBQzVDO0FBQUEsVUFDRjtBQUFBLFFBQ0YsUUFBUTtBQUFBLFFBQ047QUFFRixlQUFPLENBQUM7QUFBQSxNQUNWO0FBQUEsTUFDQUksTUFBTUMsT0FBT0MsTUFBTTtBQUNqQixlQUFPQyxXQUFXSCxNQUFNQyxPQUFPO0FBQUEsVUFDN0IsR0FBSUMsUUFBUSxDQUFDO0FBQUEsVUFDYkUsYUFBYTtBQUFBLFFBQ2YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUFDO0FBRU4sQ0FBQztBQUVENUMsV0FBVzZDLFNBQVNDLGVBQWUsTUFBTSxDQUFFLEVBQUVDO0FBQUFBLEVBQzNDLHVCQUFDLEtBQUssVUFBTCxFQUFLLHNDQUFTLFFBQVEzQixZQUFZLGFBQ2pDLGlDQUFDLDZEQUFvQixRQUFRaEIsYUFDM0IsaUNBQUMsK0NBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUFJLEtBRE47QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUVBLEtBSEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUlBO0FBQ0YiLCJuYW1lcyI6WyJ0cnBjIiwiQ09PS0lFX05BTUUiLCJVTkFVVEhFRF9FUlJfTVNHIiwiUXVlcnlDbGllbnQiLCJRdWVyeUNsaWVudFByb3ZpZGVyIiwiaHR0cEJhdGNoTGluayIsIlRSUENDbGllbnRFcnJvciIsImNyZWF0ZVJvb3QiLCJzdXBlcmpzb24iLCJBcHAiLCJzdGFydExvZ2luIiwicXVlcnlDbGllbnQiLCJyZWRpcmVjdFRvTG9naW5JZlVuYXV0aG9yaXplZCIsImVycm9yIiwid2luZG93IiwiaXNVbmF1dGhvcml6ZWQiLCJtZXNzYWdlIiwiZ2V0UXVlcnlDYWNoZSIsInN1YnNjcmliZSIsImV2ZW50IiwidHlwZSIsImFjdGlvbiIsInF1ZXJ5Iiwic3RhdGUiLCJjb25zb2xlIiwiZ2V0TXV0YXRpb25DYWNoZSIsIm11dGF0aW9uIiwidHJwY0NsaWVudCIsImNyZWF0ZUNsaWVudCIsImxpbmtzIiwidXJsIiwidHJhbnNmb3JtZXIiLCJoZWFkZXJzIiwicmF3Iiwic2Vzc2lvblN0b3JhZ2UiLCJnZXRJdGVtIiwicHJlZml4IiwicGFpciIsInNwbGl0IiwiZmluZCIsInMiLCJ0cmltIiwic3RhcnRzV2l0aCIsInRva2VuIiwic2xpY2UiLCJsZW5ndGgiLCJBdXRob3JpemF0aW9uIiwiZmV0Y2giLCJpbnB1dCIsImluaXQiLCJnbG9iYWxUaGlzIiwiY3JlZGVudGlhbHMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIm1haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRycGMgfSBmcm9tIFwiQC9saWIvdHJwY1wiO1xuaW1wb3J0IHsgQ09PS0lFX05BTUUsIFVOQVVUSEVEX0VSUl9NU0cgfSBmcm9tICdAc2hhcmVkL2NvbnN0JztcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiO1xuaW1wb3J0IHsgaHR0cEJhdGNoTGluaywgVFJQQ0NsaWVudEVycm9yIH0gZnJvbSBcIkB0cnBjL2NsaWVudFwiO1xuaW1wb3J0IHsgY3JlYXRlUm9vdCB9IGZyb20gXCJyZWFjdC1kb20vY2xpZW50XCI7XG5pbXBvcnQgc3VwZXJqc29uIGZyb20gXCJzdXBlcmpzb25cIjtcbmltcG9ydCBBcHAgZnJvbSBcIi4vQXBwXCI7XG5pbXBvcnQgeyBzdGFydExvZ2luIH0gZnJvbSBcIi4vY29uc3RcIjtcbmltcG9ydCBcIi4vaW5kZXguY3NzXCI7XG5cbmNvbnN0IHF1ZXJ5Q2xpZW50ID0gbmV3IFF1ZXJ5Q2xpZW50KCk7XG5cbmNvbnN0IHJlZGlyZWN0VG9Mb2dpbklmVW5hdXRob3JpemVkID0gKGVycm9yOiB1bmtub3duKSA9PiB7XG4gIGlmICghKGVycm9yIGluc3RhbmNlb2YgVFJQQ0NsaWVudEVycm9yKSkgcmV0dXJuO1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xuXG4gIGNvbnN0IGlzVW5hdXRob3JpemVkID0gZXJyb3IubWVzc2FnZSA9PT0gVU5BVVRIRURfRVJSX01TRztcblxuICBpZiAoIWlzVW5hdXRob3JpemVkKSByZXR1cm47XG5cbiAgc3RhcnRMb2dpbigpO1xufTtcblxucXVlcnlDbGllbnQuZ2V0UXVlcnlDYWNoZSgpLnN1YnNjcmliZShldmVudCA9PiB7XG4gIGlmIChldmVudC50eXBlID09PSBcInVwZGF0ZWRcIiAmJiBldmVudC5hY3Rpb24udHlwZSA9PT0gXCJlcnJvclwiKSB7XG4gICAgY29uc3QgZXJyb3IgPSBldmVudC5xdWVyeS5zdGF0ZS5lcnJvcjtcbiAgICByZWRpcmVjdFRvTG9naW5JZlVuYXV0aG9yaXplZChlcnJvcik7XG4gICAgY29uc29sZS5lcnJvcihcIltBUEkgUXVlcnkgRXJyb3JdXCIsIGVycm9yKTtcbiAgfVxufSk7XG5cbnF1ZXJ5Q2xpZW50LmdldE11dGF0aW9uQ2FjaGUoKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICBpZiAoZXZlbnQudHlwZSA9PT0gXCJ1cGRhdGVkXCIgJiYgZXZlbnQuYWN0aW9uLnR5cGUgPT09IFwiZXJyb3JcIikge1xuICAgIGNvbnN0IGVycm9yID0gZXZlbnQubXV0YXRpb24uc3RhdGUuZXJyb3I7XG4gICAgcmVkaXJlY3RUb0xvZ2luSWZVbmF1dGhvcml6ZWQoZXJyb3IpO1xuICAgIGNvbnNvbGUuZXJyb3IoXCJbQVBJIE11dGF0aW9uIEVycm9yXVwiLCBlcnJvcik7XG4gIH1cbn0pO1xuXG5jb25zdCB0cnBjQ2xpZW50ID0gdHJwYy5jcmVhdGVDbGllbnQoe1xuICBsaW5rczogW1xuICAgIGh0dHBCYXRjaExpbmsoe1xuICAgICAgdXJsOiBcIi9hcGkvdHJwY1wiLFxuICAgICAgdHJhbnNmb3JtZXI6IHN1cGVyanNvbixcbiAgICAgIGhlYWRlcnMoKSB7XG4gICAgICAgIC8vIFByZXZpZXcgYXV0by1sb2dpbiBmYWxsYmFjazogd2hlbiB0aGUgYnJvd3NlciBibG9ja3MgaWZyYW1lIGNvb2tpZXNcbiAgICAgICAgLy8gKFNhZmFyaSBJVFAgLyBwcml2YXRlIGJyb3dzaW5nIC8gV2ViVmlldyksIHRoZSBydW50aW1lIG1pcnJvcnMgdGhlXG4gICAgICAgIC8vIHNlc3Npb24gaW50byBzZXNzaW9uU3RvcmFnZSBzbyB3ZSBjYW4gZm9yd2FyZCBpdCBhcyBhIEJlYXJlciB0b2tlbi5cbiAgICAgICAgLy8gVGhlIHJlZ3VsYXIgT0F1dGggY29va2llIGZsb3cga2VlcHMgd29ya2luZyBhbmQgdGFrZXMgcHJpb3JpdHkgc2VydmVyLXNpZGUuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmF3ID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcIm1hbnVzLWNvb2tpZVwiKTtcbiAgICAgICAgICBpZiAocmF3KSB7XG4gICAgICAgICAgICBjb25zdCBwcmVmaXggPSBgJHtDT09LSUVfTkFNRX09YDtcbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSByYXcuc3BsaXQoXCI7XCIpLmZpbmQocyA9PiBzLnRyaW0oKS5zdGFydHNXaXRoKHByZWZpeCkpO1xuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSBwYWlyPy50cmltKCkuc2xpY2UocHJlZml4Lmxlbmd0aCk7XG4gICAgICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8vIHNlc3Npb25TdG9yYWdlIHVuYXZhaWxhYmxlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfSxcbiAgICAgIGZldGNoKGlucHV0LCBpbml0KSB7XG4gICAgICAgIHJldHVybiBnbG9iYWxUaGlzLmZldGNoKGlucHV0LCB7XG4gICAgICAgICAgLi4uKGluaXQgPz8ge30pLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiBcImluY2x1ZGVcIixcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxufSk7XG5cbmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb290XCIpISkucmVuZGVyKFxuICA8dHJwYy5Qcm92aWRlciBjbGllbnQ9e3RycGNDbGllbnR9IHF1ZXJ5Q2xpZW50PXtxdWVyeUNsaWVudH0+XG4gICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XG4gICAgICA8QXBwIC8+XG4gICAgPC9RdWVyeUNsaWVudFByb3ZpZGVyPlxuICA8L3RycGMuUHJvdmlkZXI+XG4pO1xuIl0sImZpbGUiOiIvaG9tZS91YnVudHUvbG9iZWh1Yi1jbG9uZS9jbGllbnQvc3JjL21haW4udHN4In0=