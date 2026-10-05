import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  perspective: 'published',
  useCdn: true,
  stega: {
    studioUrl: '/studio',
    filter: (props) => {
      const structuralFields = [
        'slug', 'language', 'key', 'date', 'url', 'href', 'alt',
        'githubUrl', 'projectUrl', 'resumeURL', 'startYear', 'endYear',
      ];
      return !props.sourcePath.some((field) => structuralFields.includes(field))
        && props.filterDefault(props);
    },
  },
})
