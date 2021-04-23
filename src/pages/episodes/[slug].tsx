
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { api } from '../../services/api'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

import styles from './episode.module.scss'

type Episode = {
    id: string,
    title: string,
    members: string,
    published_at: string,
    thumbnail: string,
    description: string,
    url: string,
    publishedAt: string,
    duration: number,
    durationAsString: string,
}

type EpisodeProps = {
    episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
    return (
        <div className={styles.episodeContainer}>
            <div className={styles.episode}>
                <div className={styles.thumbnailContainer}>
                    <Link href="/">
                        <button type="button">
                            <img src="/arrow-left.svg" alt="Voltar" />
                        </button>
                    </Link>

                    <Image
                        width={700}
                        height={160}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <button type="button">
                        <img src="/play.svg" alt="Tocar episódio" />
                    </button>
                </div>

                <header>
                    <h1>{episode.title}</h1>
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>

                <div className={styles.description}
                    dangerouslySetInnerHTML={{ __html: episode.description }} />
            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    // get the latest episodes, these will be the most accessed episodes
    // the others will be generated as people access them
    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })
    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })
    // paths: [] means next will not generate any episodes statically
    // paths: [object] means next will generate specified episode paths

    // fallback: false means if the episode was not generated in the paths array (when filled), server will default to 404
    // fallback: true means if the episode is not in paths array, it will be requested and generated client-side
    // fallback: blocking means that the episodes will be loaded server-side, before page loads client-side
    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params
    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        ...data,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
            locale: ptBR
        }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        url: data.file.url
    }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24, // 24 hours
    }
}