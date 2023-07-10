export interface GroupRole {
  title: string;
  anonymous: string;
  authenticatedUser: string;
  submitter: string;
  curator: string;
  admin: string;
  submitterOfTheRecord: string;
  authorOfTheRecord: string;
  collectionCurator: string;
  headOfUnit: string;
  delegatedCollectionCurator: string;
  delegatedHeadOfUnit: string;
}

export const GroupRoles: GroupRole[] = [
  {
    title: 'browse repository structures',
    anonymous: 'Y',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'search/browse public records',
    anonymous: 'Y',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'see public records',
    anonymous: 'Y',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'download public files',
    anonymous: 'Y',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'download embargoed files (during the embargo period - after they become just as \"public\")',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'N',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'download restricted files (EPFL only files)',
    anonymous: 'N',
    authenticatedUser: 'Y',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'N',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'download reserved files (like an embargo that never expires)',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'N',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'create a publication/product/patent',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'access own person authority file, if exists (created by the sync or manually by authorized users)',
    anonymous: '-',
    authenticatedUser: 'Y',
    submitter: '-',
    curator: '-',
    admin: '-',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'edit own person authority file, if exists (only optional attributes not provided from the synchronization process)',
    anonymous: '-',
    authenticatedUser: 'Y',
    submitter: '-',
    curator: '-',
    admin: '-',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'reference in submitted publications EPFL contributors, picking them from both the internal DSpace authority file and EPFL search API, or manually entering a (external) contributor\'s name ',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'reference in submitted publications journals, picking them from both the internal DSpace authority file and SherpaRomeo API, or manually entering a journal title (once the publication is approved by a curator, this will create a new journal authority record)',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'view ongoing submissions',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'edit ongoing submissions',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'review submission in the collections with workflow',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'hide/show a record in the \"unit collection\" listing',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'claim/unclaim a record for a \"thematic collection\" ',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'Y',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'Y',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'edit \"unit collection\" details (only optional attributes not provided from the synchronization process)',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'edit \"thematic collection\" details',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'Y',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'Y',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'edit a published publication, without creating a new version *',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'attach a file to a published publication',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'change permission of files for published publications',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'create a new version of a publication/patent/dataset (subject to workflow approval) **',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'edit a published publication by requesting a correction (subject to workflow approval), correction requester and curators are notified.',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'directly create authority file records (i.e., journal, org unit, person)',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'directly create  thematic collection',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'directly edit any other published authority files or thematic collections',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'access site (usage, workflow, login) statistics reports',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: 'N',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'access communities and physical collection usage statistics reports',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'access publication/dataset/patent/journal usage statistics reports ',
    anonymous: 'N',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'Y',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'Y',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'access person usage statistics reports ',
    anonymous: 'N',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'Y',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'Y',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'access unit collection usage statistics reports ',
    anonymous: 'N',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'Y',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'Y',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'access thematic collection usage statistics reports ',
    anonymous: 'N',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'Y',
    collectionCurator: 'Y',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'Y',
    delegatedHeadOfUnit: 'Y',
  },
  {
    title: 'create workflow steps ',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'create new communities and physical collections',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'create and manage users / groups (includes general roles)',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'assign roles (i.e., curator or delegated curator) for thematic collections ',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'Y',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'assign roles (i.e., delegated curator) for unit collections ***',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: 'N',
    headOfUnit: 'Y',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'can generate a personal API token',
    anonymous: 'N',
    authenticatedUser: 'Y',
    submitter: 'Y',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
  {
    title: 'can chnage submitter of a record',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'Y',
    admin: 'Y',
    submitterOfTheRecord: 'Y',
    authorOfTheRecord: 'N',
    collectionCurator: 'N',
    headOfUnit: 'N',
    delegatedCollectionCurator: 'N',
    delegatedHeadOfUnit: 'N',
  },
  {
    title: 'can impersonate any user except administrators',
    anonymous: 'N',
    authenticatedUser: 'N',
    submitter: 'N',
    curator: 'N',
    admin: 'Y',
    submitterOfTheRecord: '-',
    authorOfTheRecord: '-',
    collectionCurator: '-',
    headOfUnit: '-',
    delegatedCollectionCurator: '-',
    delegatedHeadOfUnit: '-',
  },
];


// function used to parse the string copied from excel:
// const parseAccess = (access) => {
//   const [title, ...permissions] = access.split('\t');
//   const role = {
//     title,
//     anonymous: permissions[0],
//     authenticatedUser: permissions[1],
//     submitter: permissions[2],
//     curator: permissions[3],
//     admin: permissions[4],
//     submitterOfTheRecord: permissions[5],
//     authorOfTheRecord: permissions[6],
//     collectionCurator: permissions[7],
//     headOfUnit: permissions[8],
//   };
//   return role;
// };
