import { Changes } from 'endorphin';
import { Movie, PlaybackState } from 'codemirror-movie';
import { EmmetEditor, EmmetConfig } from '@emmetio/codemirror-plugin';
import { EmComponent } from '../../types';
import { EmEditor } from '../em-editor/em-editor';

interface EmMovieProps {
    mode: string;
    autoplay: boolean;
    movie: (editor: EmmetEditor) => Movie;
}

interface EmMovieState {
    movie: Movie | null;
    paused: boolean;
    options: Partial<EmmetConfig>;
    _editorOptions?: EmmetConfig;
}

interface EmMovieExt {
    play(): void;
    pause(): void;
    stop(): void;
    replay(): void;
}

export type EmMovie = EmComponent<EmMovieProps, EmMovieState> & EmMovieExt & {
    refs: { editor: EmEditor }
};

// export const events = {
//     click(component: EmMovie) {
//         const { paused } = component.state;
//         if (paused) {
//             component.play();
//         } else {
//             component.pause();
//         }
//     }
// };

export function state(): EmMovieState {
    return {
        movie: null,
        paused: false,
        options: { attachPreview }
    };
}

export const extend: EmMovieExt = {
    play(this: EmMovie) {
        const { movie } = this.state;
        if (movie && movie.state !== PlaybackState.Play) {
            movie.play();
            this.setState({ paused: false });
        }
    },
    pause(this: EmMovie) {
        const { movie } = this.state;
        if (movie && movie.state === PlaybackState.Play) {
            movie.pause();
            this.setState({ paused: true });
        }
    },
    stop(this: EmMovie) {
        const { movie } = this.state;
        if (movie) {
            movie.stop();
            this.setState({ paused: true });
        }
    },
    replay(this: EmMovie) {
        this.stop();
        this.play();
    }
}

export function didRender(component: EmMovie, { movie }: Changes<EmMovieProps>) {
    const { editor } = component.refs.editor;
    if (!component.state._editorOptions) {
        // @ts-ignore
        component.state._editorOptions = editor.getOption('emmet');
    }

    if (movie) {
        component.stop();
        if (movie.current) {
            // Set pristine options before attaching movie
            // @ts-ignore
            editor.setOption('emmet', component.state._editorOptions);
            const m = movie.current(component.refs.editor.editor);
            component.setState({ movie: m });
            if (component.props.autoplay) {
                component.play();
            }
        } else {
            component.setState({ movie: null });
        }
    }
}

function attachPreview(editor: EmmetEditor, preview: HTMLElement, pos: CodeMirror.Position) {
    const px = editor.cursorCoords(pos, 'local');
    preview.style.left = `${px.left}px`;
    preview.style.top = `${px.bottom}px`;
    editor.getWrapperElement().parentNode!.appendChild(preview);
}
