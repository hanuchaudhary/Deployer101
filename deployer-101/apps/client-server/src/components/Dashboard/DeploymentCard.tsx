// import { DeploymentType } from "@repo/common/types";
// import { Card } from "../ui/card";
// import { formatDate } from "@/lib/tools";
// import { GitBranch, GitCommit, MoreVertical } from "lucide-react";
// import { Button } from "../ui/button";

// export function DeploymentCard({ deployment }: { deployment: DeploymentType }) {
//   return (
//     <Card className="bg-black/30 border border-gray-800 hover:bg-gray-900/20 transition-colors rounded-none first:rounded-t-md last:rounded-b-md">
//       <div className="p-4 flex items-center justify-between">
//         <div className="flex items-start gap-4">
//           <div>
//             <div className="flex items-center gap-2">
//               <h3 className="text-lg font-mono">{deployment.id}</h3>
//               <div className="flex items-center gap-1 text-gray-400">
//                 <span className="h-2 w-2 rounded-full bg-green-500"></span>
//                 <span>Ready</span>
//                 <span className="text-sm text-gray-500">
//                   {formatDate(deployment.updatedAt)}
//                 </span>
//               </div>
//             </div>
//             <div className="flex items-center gap-1 text-gray-400">
//               <span>Production</span>
//               {deployment.current && (
//                 <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">
//                   Current
//                 </span>
//               )}
//               {deployment.production && !deployment.current && (
//                 <svg
//                   viewBox="0 0 16 16"
//                   className="h-4 w-4 text-gray-500"
//                   fill="currentColor"
//                 >
//                   <path
//                     d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 118 0a8 8 0 010 16z"
//                     fillRule="evenodd"
//                     clipRule="evenodd"
//                     opacity="0.4"
//                   ></path>
//                   <path d="M7.25 11.5v-5a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0z"></path>
//                   <path d="M7 4a1 1 0 112 0 1 1 0 01-2 0z"></path>
//                 </svg>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-8">
//           <div className="flex flex-col items-end">
//             <div className="flex items-center gap-2">
//               <GitBranch className="h-4 w-4 text-gray-500" />
//               <span className="font-mono text-gray-300">
//                 {deployment.branch}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <GitCommit className="h-4 w-4 text-gray-500" />
//               <span className="font-mono text-gray-300">
//                 {deployment.commit}
//               </span>
//               <span className="text-gray-400">{deployment.commitMessage}</span>
//             </div>
//           </div>

//           <div className="text-right text-gray-400">
//             <div>{formatDate(deployment.updatedAt)}</div>
//             <div>by hanuchaudhary</div>
//           </div>

//           <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800">
//             <span className="text-xs font-medium">HC</span>
//           </div>

//           <Button variant="ghost" size="icon">
//             <MoreVertical className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//     </Card>
//   );
// }
