/**
 * AI Map Generator Component
 *
 * React component providing the user interface for AI-powered map generation.
 * Allows users to describe locations in natural language and generate maps.
 */

import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { generateAIMap, getExamplePrompts, setApiKey } from './generate/ai';

// Styled Components
const Container = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ApiKeySection = styled.div`
  margin-bottom: 16px;
`;

const ApiKeyInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
`;

const DescriptionSection = styled.div`
  margin-bottom: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ExamplesSection = styled.div`
  margin-bottom: 16px;
`;

const ExampleButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ExampleButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: white;
  color: #555;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f8f7ff;
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  background: ${props => props.disabled
    ? '#ccc'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ProgressSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 4px solid #4a90d9;
`;

const ProgressText = styled.div`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #4a90d9;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #fff5f5;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #c53030;
`;

const MetadataSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f0fff4;
  border-radius: 8px;
  border-left: 4px solid #38a169;
`;

const MetadataTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #276749;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const MetadataText = styled.div`
  font-size: 13px;
  color: #2f855a;
  line-height: 1.5;
`;

const FeatureList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 12px;
  color: #444;
`;

const FeatureItem = styled.li`
  margin-bottom: 4px;
`;

const CollapsibleHeader = styled.button`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;

  &:hover {
    background: #f8f8f8;
  }
`;

const Arrow = styled.span`
  transform: ${props => props.open ? 'rotate(90deg)' : 'rotate(0)'};
  transition: transform 0.2s ease;
`;

/**
 * AI Map Generator Component
 */
const AIMapGenerator = ({ onGenerate, gridSize = 32 }) => {
  const [apiKey, setApiKeyLocal] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [showExamples, setShowExamples] = useState(true);
  const [showApiKey, setShowApiKey] = useState(true);

  const examples = getExamplePrompts();

  // Check for stored API key
  useEffect(() => {
    const storedKey = localStorage.getItem('anthropic_api_key');
    if (storedKey) {
      setApiKeyLocal(storedKey);
      setApiKey(storedKey);
      setShowApiKey(false);
    }
  }, []);

  // Handle API key change
  const handleApiKeyChange = useCallback((e) => {
    const key = e.target.value;
    setApiKeyLocal(key);
    setApiKey(key);
    if (key) {
      localStorage.setItem('anthropic_api_key', key);
    }
  }, []);

  // Handle example selection
  const handleExampleClick = useCallback((example) => {
    setDescription(example.prompt);
  }, []);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!apiKey || !description.trim()) return;

    setIsGenerating(true);
    setError(null);
    setProgress({ stage: 'starting', message: 'Initializing...' });

    try {
      const grid = await generateAIMap(gridSize, {
        apiKey,
        description: description.trim(),
        onProgress: setProgress
      });

      // Get metadata from the last result
      const { getGeneratorState } = await import('./generate/ai');
      const state = getGeneratorState().getState();

      if (state.lastResult?.metadata) {
        setMetadata(state.lastResult.metadata);
      }

      onGenerate?.(grid);
      setProgress({ stage: 'complete', message: 'Map generated!' });
    } catch (err) {
      setError(err.message);
      setProgress(null);
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, description, gridSize, onGenerate]);

  const canGenerate = apiKey && description.trim() && !isGenerating;

  return (
    <Container>
      <Header>
        <Title>
          AI Location Generator
          <Badge>Powered by Claude</Badge>
        </Title>
      </Header>

      {/* API Key Section */}
      <CollapsibleHeader onClick={() => setShowApiKey(!showApiKey)}>
        <span>{apiKey ? 'API Key Configured' : 'API Key Required'}</span>
        <Arrow open={showApiKey}>▶</Arrow>
      </CollapsibleHeader>

      {showApiKey && (
        <ApiKeySection>
          <Label>Anthropic API Key</Label>
          <ApiKeyInput
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="sk-ant-api..."
          />
        </ApiKeySection>
      )}

      {/* Description Input */}
      <DescriptionSection>
        <Label>Describe Your Location</Label>
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the location you want to create. Be specific about rooms, features, and layout..."
          disabled={isGenerating}
        />
      </DescriptionSection>

      {/* Example Prompts */}
      <CollapsibleHeader onClick={() => setShowExamples(!showExamples)}>
        <span>Example Prompts</span>
        <Arrow open={showExamples}>▶</Arrow>
      </CollapsibleHeader>

      {showExamples && (
        <ExamplesSection>
          <ExampleButtons>
            {examples.map((example, idx) => (
              <ExampleButton
                key={idx}
                onClick={() => handleExampleClick(example)}
              >
                {example.title}
              </ExampleButton>
            ))}
          </ExampleButtons>
        </ExamplesSection>
      )}

      {/* Generate Button */}
      <GenerateButton
        disabled={!canGenerate}
        onClick={handleGenerate}
      >
        {isGenerating ? (
          <>
            <Spinner />
            Generating...
          </>
        ) : (
          <>
            ✨ Generate Map
          </>
        )}
      </GenerateButton>

      {/* Progress */}
      {isGenerating && progress && (
        <ProgressSection>
          <ProgressText>
            <Spinner />
            {progress.message}
          </ProgressText>
        </ProgressSection>
      )}

      {/* Error */}
      {error && (
        <ErrorSection>
          <ErrorText>Error: {error}</ErrorText>
        </ErrorSection>
      )}

      {/* Metadata */}
      {metadata && !isGenerating && (
        <MetadataSection>
          <MetadataTitle>AI Interpretation</MetadataTitle>
          <MetadataText>{metadata.interpretation}</MetadataText>
          {metadata.archetype && (
            <MetadataText style={{ marginTop: 8 }}>
              <strong>Archetype:</strong> {metadata.archetype}
            </MetadataText>
          )}
          {metadata.features && metadata.features.length > 0 && (
            <FeatureList>
              {metadata.features.slice(0, 6).map((feature, idx) => (
                <FeatureItem key={idx}>
                  <strong>{feature.name}</strong> ({feature.type})
                </FeatureItem>
              ))}
              {metadata.features.length > 6 && (
                <FeatureItem>...and {metadata.features.length - 6} more</FeatureItem>
              )}
            </FeatureList>
          )}
        </MetadataSection>
      )}
    </Container>
  );
};

export default AIMapGenerator;
