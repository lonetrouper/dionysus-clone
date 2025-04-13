"use client";
import { Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const Page = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();
  const router = useRouter();

  const onSubmit = async (data: FormInput) => {
    if (!!checkCredits.data) {
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
            router.push("/dashboard");
          },
          onError: (error) => {
            console.log(error);
            toast.error("Failed to create project");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
    // return true;
  };
  const hasEnoughCredits = checkCredits?.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;

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
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for this repository.
                    </p>
                  </div>
                  <p className="ml-6 text-sm text-blue-600">
                    You have <strong>{checkCredits.data?.userCredits}</strong>{" "}
                    credits remaining.
                  </p>
                </div>
              </>
            )}
            <div className="h-2"></div>
            <Button
              type="submit"
              disabled={createProject.isPending || !!checkCredits.isPending || !hasEnoughCredits}
            >
              {!!checkCredits.data ? "Create Project" : "Check Credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
