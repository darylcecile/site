import { ProjectsList } from '@/components/projects/ProjectsList';


export default function ProjectsPage() {
	return (
		<div className='px-8 flex flex-col gap-12 pt-20'>
			<div className='max-w-2xl mx-auto gap-8 flex flex-col w-full'>
				<h1 className='text-3xl'>Projects</h1>
			</div>

			<ProjectsList />
		</div>
	)
}