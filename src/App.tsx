import { Authenticator } from "@aws-amplify/ui-react";
import type { AuthUser } from "aws-amplify/auth";

function welcomeLabel(loginId?: string) {
  const raw = String(loginId ?? "").trim();
  if (!raw) return "Welcome to ScribeArchitect";
  const local = raw.includes("@") ? raw.slice(0, raw.indexOf("@")) : raw;
  const pretty = local.replace(/[._]+/g, " ").trim();
  if (!pretty) return "Welcome to ScribeArchitect";
  const titled = pretty.replace(/\b\w/g, (char) => char.toUpperCase());
  return `Welcome, ${titled}`;
}

function AuthHeader() {
  return (
    <header className="auth-brand">
      <img src="/scribe-architect.svg" alt="" width={48} height={48} />
      <div>
        <p className="auth-brand-kicker">ScribeArchitect</p>
        <h1>Sign in to continue</h1>
      </div>
    </header>
  );
}

function SplashPage({
  user,
  signOut,
}: {
  user?: AuthUser;
  signOut?: () => void;
}) {
  const loginId = user?.signInDetails?.loginId;

  return (
    <div className="app-shell">
      <header className="app-bar">
        <div className="brand">
          <img src="/scribe-architect.svg" alt="" width={40} height={40} />
          <span>ScribeArchitect</span>
        </div>
        <div className="app-bar-actions">
          <span className="user-chip">{loginId}</span>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="splash">
        <section className="hero">
          <p className="kicker">Signed in</p>
          <h1>{welcomeLabel(loginId)}</h1>
          <p className="lede">
            This is the ScribeArchitect scaffold: a React frontend on AWS Amplify
            with email login. The rest of the product will grow from here.
          </p>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Authenticator
      loginMechanisms={["email"]}
      components={{ Header: AuthHeader }}
    >
      {({ signOut, user }) => <SplashPage user={user} signOut={signOut} />}
    </Authenticator>
  );
}
