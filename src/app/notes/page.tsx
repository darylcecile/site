import { NotesList } from '@/components/notes/NotesList';


export default function NotesPage() {
	return (
		<div className='px-8 flex flex-col gap-12 pt-20'>
			<div className='max-w-2xl mx-auto gap-8 flex flex-col w-full'>
				<h1 className='text-3xl'>Notes</h1>
			</div>

			<NotesList />
		</div>
	)
}