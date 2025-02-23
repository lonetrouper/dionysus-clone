"use client";
import Image from "next/image";
// import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import refetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const Page = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();

  const onSubmit = async (data: FormInput) => {
    createProject.mutate(
      {
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
          reset();
        },
        onError: (error) => {
          console.log(error);
          toast.error("Failed to create project");
        },
      },
    );
    return true;
  };

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
          <form onSubmit={handleSubmit(onSubmit)}>
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
            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
