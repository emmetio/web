import { Changes } from 'endorphin';
import { Movie, PlaybackState } from 'codemirror-movie';
import { EmmetEditor } from '@emmetio/codemirror-plugin';
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
}

interface EmMovieExt {
    play(): void;
    pause(): void;
    stop(): void;
}

export type EmMovie = EmComponent<EmMovieProps, EmMovieState> & EmMovieExt & {
    refs: { editor: EmEditor }
};

export const events = {
    click(component: EmMovie) {
        const { movie, paused } = component.state;
        if (movie) {
            if (paused) {
                movie.play();
            } else {
                movie.pause();
            }
        }
    }
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
    }
}

export function didRender(component: EmMovie, { movie }: Changes<EmMovieProps>) {
    if (movie) {
        component.stop();
        if (movie.current) {
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
