import React, { useState } from 'react';
import { useAppSelector } from '../hooks/reduxHooks';
import { Box, Button, Typography, Card, Collapse, Divider } from '@mui/material';

const DiagnosticTool: React.FC = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const selectedDocument = useAppSelector(state => state.documents.selectedDocument);
  const allDocuments = useAppSelector(state => state.documents.documents);
  
  return (
    <Card sx={{ p: 2, mb: 2, backgroundColor: '#f0f7ff', borderLeft: '4px solid #1976d2' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Data Diagnostic Tool</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        >
          {showDiagnostics ? 'Hide Data' : 'Show Data'}
        </Button>
      </Box>
      
      <Collapse in={showDiagnostics}>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
          Selected Document Data:
        </Typography>
        
        {selectedDocument ? (
          <Box sx={{ 
            maxHeight: '400px', 
            overflow: 'auto', 
            my: 1, 
            p: 2, 
            backgroundColor: '#fff', 
            borderRadius: 1, 
            border: '1px solid #ddd'
          }}>
            <pre>{JSON.stringify(selectedDocument, null, 2)}</pre>
          </Box>
        ) : (
          <Typography color="error">No document selected</Typography>
        )}
        
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
          Available Documents ({allDocuments.length}):
        </Typography>
        
        <Box sx={{ 
          maxHeight: '400px', 
          overflow: 'auto', 
          my: 1, 
          p: 2, 
          backgroundColor: '#fff', 
          borderRadius: 1, 
          border: '1px solid #ddd'
        }}>
          <pre>{JSON.stringify(allDocuments, null, 2)}</pre>
        </Box>
      </Collapse>
    </Card>
  );
};

export default DiagnosticTool; 