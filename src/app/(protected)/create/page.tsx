"use client";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const Page = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src="/repository.png"
        alt="repository"
        width={300}
        height={300}
        className="h-[300px] w-[300px]"
      />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your github repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the name of the repository to link it ByteBlaze
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              type="url"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="Github Token(Optional)"
            />
            <div className="h-2"></div>
            <Button>Create Project</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
