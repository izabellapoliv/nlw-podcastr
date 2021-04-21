export default function Home(props) {
  return (
    <div>
      {JSON.stringify(props.episodes)}
    </div>
  )
}

export async function getStaticProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data
    },
    revalidate: 60 * 60 * 8,
  }
}
