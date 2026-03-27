import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { TextField } from "@/ui/components/TextField";
import { FeatherArrowRight, FeatherXCircle } from "@subframe/core";

const CONFLUENCE_URL =
  "https://belongranda.atlassian.net/wiki/spaces/BEL/pages/3814556263/BYO+Modem+Tools+Compatibility+checker+setup+guides#Try-out-the-demo-for-yourself%3A";

const BELONG_LOGO_URL =
  "https://res.cloudinary.com/subframe/image/upload/v1774220418/uploads/11901/d5boxn9jzxijpwfu8wmg.png";

export function Login() {
  const [searchParams] = useSearchParams();
  const hasError = searchParams.has("error");
  const next = searchParams.get("next") || "/";

  const [password, setPassword] = useState("");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-color-primary-800 px-6 py-12">
      <div className="flex w-full max-w-[320px] flex-col items-center gap-8">
        <div className="flex w-full flex-col items-center gap-20">
          <div className="flex flex-col items-center gap-8 px-4 py-4 mobile:px-2 mobile:py-2">
            <img className="flex-none" src={BELONG_LOGO_URL} alt="Belong" />
          </div>
          <div className="flex w-full flex-col items-center gap-3">
            <form
              action="/api/login"
              method="POST"
              className="flex w-full flex-col items-center gap-4 rounded-xl bg-[#114e5f] px-2 py-2"
            >
              <input type="hidden" name="next" value={next} />
              <div className="flex w-full items-center gap-2">
                <TextField
                  className="h-auto grow shrink-0 basis-0"
                  label=""
                  helpText=""
                  icon={null}
                  iconRight={null}
                >
                  <TextField.Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    autoFocus
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(event.target.value)
                    }
                  />
                </TextField>
                <IconButton
                  variant="option-1"
                  size="large"
                  icon={<FeatherArrowRight />}
                  type="submit"
                />
              </div>
            </form>
            {hasError && (
              <Badge variant="error" icon={<FeatherXCircle />}>
                Incorrect password
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-caption font-caption text-neutral-100">
            Need the password?
          </span>
          <LinkButton
            variant="inverse"
            size="small"
            onClick={() => window.open(CONFLUENCE_URL, "_blank")}
          >
            Get it here
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
