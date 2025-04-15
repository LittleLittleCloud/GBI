import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const Header: React.FC<{}> = ({
}) => {
  return (
    <Card className="w-1/4 mb-4 m-4">
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">GBI Visualizer</CardTitle>
            <CardDescription className="flex flex-wrap gap-2">
              <a
                href="https://github.com/LittleLittleCloud/GBI?tab=readme-ov-file#what-is-gbi-gold-base-index"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                [What is GBI?]
              </a>
              <a
                href="https://github.com/LittleLittleCloud/GBI/issues"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                [Create an Issue]
              </a>
              <a
                href="https://github.com/LittleLittleCloud/GBI"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                [Give US A Star]
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};