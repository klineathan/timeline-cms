<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEditor, EditorContent, type Editor } from 'svelte-tiptap';
	import type { Readable } from 'svelte/store';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import Youtube from '@tiptap/extension-youtube';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Bold from '@lucide/svelte/icons/bold';
	import Italic from '@lucide/svelte/icons/italic';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Quote from '@lucide/svelte/icons/quote';
	import Code from '@lucide/svelte/icons/code';
	import Heading1 from '@lucide/svelte/icons/heading-1';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import ImageIcon from '@lucide/svelte/icons/image';
	import LinkIcon from '@lucide/svelte/icons/link';
	import YoutubeIcon from '@lucide/svelte/icons/youtube';
	import Undo from '@lucide/svelte/icons/undo';
	import Redo from '@lucide/svelte/icons/redo';
	import Minus from '@lucide/svelte/icons/minus';

	interface Props {
		content?: string;
		contentJson?: object | null;
		onUpdate?: (html: string, json: object) => void;
		placeholder?: string;
	}

	let { content = '', contentJson = null, onUpdate, placeholder = "What's on your mind?" }: Props = $props();

	let editorStore = $state<Readable<Editor> | null>(null);
	let editor = $derived(editorStore ? $editorStore : null);
	let linkDialogOpen = $state(false);
	let imageDialogOpen = $state(false);
	let youtubeDialogOpen = $state(false);
	let linkUrl = $state('');
	let imageUrl = $state('');
	let youtubeUrl = $state('');

	onMount(() => {
		editorStore = createEditor({
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3]
					}
				}),
				Image.configure({
					HTMLAttributes: {
						class: 'rounded-lg max-w-full h-auto'
					}
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-amber-500 underline hover:text-amber-400'
					}
				}),
				Placeholder.configure({
					placeholder
				}),
				Youtube.configure({
					HTMLAttributes: {
						class: 'rounded-lg overflow-hidden'
					}
				})
			],
			content: contentJson || content || '',
			editorProps: {
				attributes: {
					class:
						'prose prose-invert prose-stone max-w-none min-h-[200px] focus:outline-none px-4 py-3'
				}
			},
			onUpdate: ({ editor: ed }) => {
				const html = ed.getHTML();
				const json = ed.getJSON();
				onUpdate?.(html, json);
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function addLink() {
		if (linkUrl && editor) {
			editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
		}
		linkDialogOpen = false;
		linkUrl = '';
	}

	function addImage() {
		if (imageUrl && editor) {
			editor.chain().focus().setImage({ src: imageUrl }).run();
		}
		imageDialogOpen = false;
		imageUrl = '';
	}

	function addYoutube() {
		if (youtubeUrl && editor) {
			editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
		}
		youtubeDialogOpen = false;
		youtubeUrl = '';
	}
</script>

<div class="border border-stone-700 rounded-lg overflow-hidden bg-stone-800/30">
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center gap-1 p-2 bg-stone-800/50 border-b border-stone-700">
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('bold') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleBold().run()}
					>
						<Bold class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Bold</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('italic') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleItalic().run()}
					>
						<Italic class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Italic</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('strike') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleStrike().run()}
					>
						<Strikethrough class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Strikethrough</TooltipContent>
			</Tooltip>

			<Separator orientation="vertical" class="h-6 bg-stone-700 mx-1" />

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('heading', { level: 1 }) ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
					>
						<Heading1 class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Heading 1</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('heading', { level: 2 }) ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
					>
						<Heading2 class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Heading 2</TooltipContent>
			</Tooltip>

			<Separator orientation="vertical" class="h-6 bg-stone-700 mx-1" />

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('bulletList') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleBulletList().run()}
					>
						<List class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Bullet List</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('orderedList') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleOrderedList().run()}
					>
						<ListOrdered class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Ordered List</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('blockquote') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleBlockquote().run()}
					>
						<Quote class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Quote</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('codeBlock') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
					>
						<Code class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Code Block</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-700"
						onclick={() => editor?.chain().focus().setHorizontalRule().run()}
					>
						<Minus class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Horizontal Rule</TooltipContent>
			</Tooltip>

			<Separator orientation="vertical" class="h-6 bg-stone-700 mx-1" />

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 {editor?.isActive('link') ? 'bg-stone-700 text-amber-500' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700'}"
						onclick={() => (linkDialogOpen = true)}
					>
						<LinkIcon class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Add Link</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-700"
						onclick={() => (imageDialogOpen = true)}
					>
						<ImageIcon class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Add Image</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-700"
						onclick={() => (youtubeDialogOpen = true)}
					>
						<YoutubeIcon class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Add YouTube Video</TooltipContent>
			</Tooltip>

			<Separator orientation="vertical" class="h-6 bg-stone-700 mx-1" />

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-700"
						onclick={() => editor?.chain().focus().undo().run()}
						disabled={!editor?.can().undo()}
					>
						<Undo class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Undo</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-700"
						onclick={() => editor?.chain().focus().redo().run()}
						disabled={!editor?.can().redo()}
					>
						<Redo class="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent class="bg-stone-700 border-stone-600 text-stone-100">Redo</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>

	<!-- Editor -->
	<div class="min-h-[300px]">
		{#if editor}
			<EditorContent editor={editor} />
		{/if}
	</div>
</div>

<!-- Link Dialog -->
<Dialog bind:open={linkDialogOpen}>
	<DialogContent class="bg-stone-900 border-stone-800">
		<DialogHeader>
			<DialogTitle class="text-stone-100">Add Link</DialogTitle>
			<DialogDescription class="text-stone-400">Enter the URL for the link</DialogDescription>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="linkUrl" class="text-stone-300">URL</Label>
				<Input
					id="linkUrl"
					bind:value={linkUrl}
					placeholder="https://example.com"
					class="bg-stone-800 border-stone-700 text-stone-100"
				/>
			</div>
		</div>
		<DialogFooter>
			<Button
				variant="outline"
				onclick={() => (linkDialogOpen = false)}
				class="border-stone-700 text-stone-300">Cancel</Button
			>
			<Button onclick={addLink} class="bg-amber-500 hover:bg-amber-600 text-white"
				>Add Link</Button
			>
		</DialogFooter>
	</DialogContent>
</Dialog>

<!-- Image Dialog -->
<Dialog bind:open={imageDialogOpen}>
	<DialogContent class="bg-stone-900 border-stone-800">
		<DialogHeader>
			<DialogTitle class="text-stone-100">Add Image</DialogTitle>
			<DialogDescription class="text-stone-400">Enter the URL of the image</DialogDescription>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="imageUrl" class="text-stone-300">Image URL</Label>
				<Input
					id="imageUrl"
					bind:value={imageUrl}
					placeholder="https://example.com/image.jpg"
					class="bg-stone-800 border-stone-700 text-stone-100"
				/>
			</div>
		</div>
		<DialogFooter>
			<Button
				variant="outline"
				onclick={() => (imageDialogOpen = false)}
				class="border-stone-700 text-stone-300">Cancel</Button
			>
			<Button onclick={addImage} class="bg-amber-500 hover:bg-amber-600 text-white"
				>Add Image</Button
			>
		</DialogFooter>
	</DialogContent>
</Dialog>

<!-- YouTube Dialog -->
<Dialog bind:open={youtubeDialogOpen}>
	<DialogContent class="bg-stone-900 border-stone-800">
		<DialogHeader>
			<DialogTitle class="text-stone-100">Add YouTube Video</DialogTitle>
			<DialogDescription class="text-stone-400">Enter the YouTube video URL</DialogDescription>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="youtubeUrl" class="text-stone-300">YouTube URL</Label>
				<Input
					id="youtubeUrl"
					bind:value={youtubeUrl}
					placeholder="https://www.youtube.com/watch?v=..."
					class="bg-stone-800 border-stone-700 text-stone-100"
				/>
			</div>
		</div>
		<DialogFooter>
			<Button
				variant="outline"
				onclick={() => (youtubeDialogOpen = false)}
				class="border-stone-700 text-stone-300">Cancel</Button
			>
			<Button onclick={addYoutube} class="bg-amber-500 hover:bg-amber-600 text-white"
				>Add Video</Button
			>
		</DialogFooter>
	</DialogContent>
</Dialog>

<style>
	:global(.ProseMirror) {
		min-height: 200px;
		color: #fafaf9; /* stone-50 - light text for dark background */
	}

	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #78716c;
		pointer-events: none;
		height: 0;
	}

	:global(.ProseMirror:focus) {
		outline: none;
	}

	:global(.ProseMirror img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
	}

	:global(.ProseMirror iframe) {
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 0.5rem;
	}

	:global(.ProseMirror blockquote) {
		border-left: 3px solid #f59e0b;
		padding-left: 1rem;
		margin-left: 0;
		color: #a8a29e;
	}

	:global(.ProseMirror pre) {
		background: #1c1917;
		border-radius: 0.5rem;
		padding: 1rem;
		overflow-x: auto;
	}

	:global(.ProseMirror code) {
		background: #292524;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	:global(.ProseMirror pre code) {
		background: none;
		padding: 0;
	}

	:global(.ProseMirror h1) {
		font-size: 1.875rem;
		font-weight: 700;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.ProseMirror h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
	}

	:global(.ProseMirror h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	:global(.ProseMirror ul),
	:global(.ProseMirror ol) {
		padding-left: 1.5rem;
	}

	:global(.ProseMirror li) {
		margin: 0.25rem 0;
	}

	:global(.ProseMirror hr) {
		border: none;
		border-top: 1px solid #44403c;
		margin: 1.5rem 0;
	}
</style>
